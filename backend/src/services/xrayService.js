import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env.js';

class XrayService {
  constructor() {
    this.sessionCookie = null;
    this.realityPublicKey = null;
    this.realityShortId = null;
    this.client = axios.create({
      baseURL: config.xray.panelUrl,
      timeout: 30000,
      withCredentials: true,
    });
  }

  /**
   * Логин в 3x-ui панель, получение session cookie
   */
  async login() {
    try {
      const response = await this.client.post('/login', {
        username: config.xray.panelUsername,
        password: config.xray.panelPassword,
      });

      const cookies = response.headers['set-cookie'];
      if (cookies) {
        this.sessionCookie = cookies.map((c) => c.split(';')[0]).join('; ');
      }

      console.log('[XrayService] Logged in to 3x-ui panel');
      return response.data;
    } catch (error) {
      console.error('[XrayService] Login failed:', error.message);
      throw error;
    }
  }

  /**
   * Гарантирует наличие активной сессии
   */
  async ensureSession() {
    if (!this.sessionCookie) {
      await this.login();
    }
  }

  /**
   * Выполняет запрос с автоматическим перелогином при 401
   */
  async request(method, url, data) {
    await this.ensureSession();

    try {
      const response = await this.client({
        method,
        url,
        data,
        headers: { Cookie: this.sessionCookie },
      });

      if (response.data && response.data.success === false) {
        // Возможно сессия истекла
        if (response.data.msg && response.data.msg.includes('login')) {
          this.sessionCookie = null;
          await this.ensureSession();
          const retry = await this.client({
            method,
            url,
            data,
            headers: { Cookie: this.sessionCookie },
          });
          return retry.data;
        }
      }

      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        this.sessionCookie = null;
        await this.ensureSession();
        const retry = await this.client({
          method,
          url,
          data,
          headers: { Cookie: this.sessionCookie },
        });
        return retry.data;
      }
      throw error;
    }
  }

  /**
   * Загружает настройки inbound и извлекает Reality publicKey и shortId.
   * Если inbound не найден — создаёт его автоматически.
   */
  async loadInboundSettings() {
    const result = await this.request('get', '/panel/api/inbounds/list');

    if (!result || !result.obj) {
      throw new Error('Failed to fetch inbounds from 3x-ui');
    }

    let inbound = result.obj.find((ib) => ib.id === config.xray.inboundId);

    if (!inbound) {
      console.log('[XrayService] Inbound not found, creating VLESS+Reality inbound...');
      inbound = await this.createInbound();
    }

    // streamSettings содержит Reality настройки
    const streamSettings = JSON.parse(inbound.streamSettings || '{}');
    const realitySettings = streamSettings?.realitySettings;

    if (realitySettings) {
      const settings = realitySettings.settings || {};
      this.realityPublicKey = settings.publicKey || realitySettings.publicKey || '';
      this.realityShortId = (realitySettings.shortIds && realitySettings.shortIds[0]) || '';
      console.log(`[XrayService] Reality publicKey: ${this.realityPublicKey.substring(0, 10)}...`);
      console.log(`[XrayService] Reality shortId: ${this.realityShortId}`);
    } else {
      console.warn('[XrayService] No Reality settings found in inbound');
    }

    return inbound;
  }

  /**
   * Создаёт VLESS+Reality inbound в 3x-ui
   */
  async createInbound() {
    const { serverPort, realitySni } = config.xray;

    const inboundData = {
      up: 0,
      down: 0,
      total: 0,
      remark: 'AntiGlusch VLESS Reality',
      enable: true,
      expiryTime: 0,
      listen: '',
      port: serverPort,
      protocol: 'vless',
      settings: JSON.stringify({
        clients: [],
        decryption: 'none',
        fallbacks: [],
      }),
      streamSettings: JSON.stringify({
        network: 'tcp',
        security: 'reality',
        realitySettings: {
          show: false,
          xver: 0,
          dest: `${realitySni}:443`,
          serverNames: [realitySni],
          privateKey: '',
          minClient: '',
          maxClient: '',
          maxTimediff: 0,
          shortIds: [''],
          settings: {
            publicKey: '',
            fingerprint: config.xray.realityFingerprint,
            serverName: '',
            spiderX: '/',
          },
        },
        tcpSettings: {
          acceptProxyProtocol: false,
          header: { type: 'none' },
        },
      }),
      sniffing: JSON.stringify({
        enabled: true,
        destOverride: ['http', 'tls', 'quic', 'fakedns'],
        metadataOnly: false,
        routeOnly: false,
      }),
      allocate: JSON.stringify({
        strategy: 'always',
        refresh: 5,
        concurrency: 3,
      }),
    };

    const result = await this.request('post', '/panel/api/inbounds/add', inboundData);

    if (!result || result.success === false) {
      throw new Error(`Failed to create inbound: ${result?.msg || 'unknown error'}`);
    }

    console.log('[XrayService] Inbound created successfully');

    // Перечитаем inbound чтобы получить сгенерированные ключи
    const refreshed = await this.request('get', '/panel/api/inbounds/list');
    const inbound = refreshed.obj.find((ib) => ib.remark === 'AntiGlusch VLESS Reality');

    if (!inbound) {
      throw new Error('Created inbound not found in list');
    }

    // Обновляем inboundId в конфиге если он отличается
    if (inbound.id !== config.xray.inboundId) {
      console.log(`[XrayService] Inbound created with id=${inbound.id}, updating config`);
      config.xray.inboundId = inbound.id;
    }

    return inbound;
  }

  /**
   * Инициализация — логин + загрузка настроек inbound
   */
  async initialize() {
    try {
      await this.login();
      await this.loadInboundSettings();
      console.log('[XrayService] Initialized successfully');
    } catch (error) {
      console.error('[XrayService] Initialization failed:', error.message);
      console.warn('[XrayService] Will retry on first request');
    }
  }

  /**
   * Создать клиента в 3x-ui inbound
   */
  async createClient(email) {
    const uuid = uuidv4();

    const clientSettings = {
      clients: [
        {
          id: uuid,
          flow: 'xtls-rprx-vision',
          email,
          limitIp: 0,
          totalGB: 0,
          expiryTime: 0,
          enable: true,
        },
      ],
    };

    const result = await this.request('post', '/panel/api/inbounds/addClient', {
      id: config.xray.inboundId,
      settings: JSON.stringify(clientSettings),
    });

    if (!result || result.success === false) {
      throw new Error(`Failed to create xray client: ${result?.msg || 'unknown error'}`);
    }

    console.log(`[XrayService] Created client ${email} with UUID ${uuid}`);
    return { uuid, email };
  }

  /**
   * Генерирует VLESS:// URL для клиента
   */
  generateVlessUrl(uuid, name) {
    const { serverAddress, serverPort, realitySni, realityFingerprint } = config.xray;
    const pbk = this.realityPublicKey || '';
    const sid = this.realityShortId || '';
    const encodedName = encodeURIComponent(name);

    return `vless://${uuid}@${serverAddress}:${serverPort}?flow=xtls-rprx-vision&type=tcp&headerType=none&security=reality&fp=${realityFingerprint}&sni=${realitySni}&pbk=${pbk}&sid=${sid}&spx=/#${encodedName}`;
  }

  /**
   * Отключить клиента (enable: false)
   */
  async disableClient(clientUuid, email) {
    const clientSettings = {
      clients: [
        {
          id: clientUuid,
          flow: 'xtls-rprx-vision',
          email,
          limitIp: 0,
          totalGB: 0,
          expiryTime: 0,
          enable: false,
        },
      ],
    };

    const result = await this.request(
      'post',
      `/panel/api/inbounds/updateClient/${clientUuid}`,
      {
        id: config.xray.inboundId,
        settings: JSON.stringify(clientSettings),
      }
    );

    if (!result || result.success === false) {
      throw new Error(`Failed to disable xray client: ${result?.msg || 'unknown error'}`);
    }

    console.log(`[XrayService] Disabled client ${email}`);
    return result;
  }

  /**
   * Включить клиента (enable: true)
   */
  async enableClient(clientUuid, email) {
    const clientSettings = {
      clients: [
        {
          id: clientUuid,
          flow: 'xtls-rprx-vision',
          email,
          limitIp: 0,
          totalGB: 0,
          expiryTime: 0,
          enable: true,
        },
      ],
    };

    const result = await this.request(
      'post',
      `/panel/api/inbounds/updateClient/${clientUuid}`,
      {
        id: config.xray.inboundId,
        settings: JSON.stringify(clientSettings),
      }
    );

    if (!result || result.success === false) {
      throw new Error(`Failed to enable xray client: ${result?.msg || 'unknown error'}`);
    }

    console.log(`[XrayService] Enabled client ${email}`);
    return result;
  }

  /**
   * Удалить клиента
   */
  async deleteClient(clientUuid) {
    const result = await this.request(
      'post',
      `/panel/api/inbounds/${config.xray.inboundId}/delClient/${clientUuid}`
    );

    if (!result || result.success === false) {
      throw new Error(`Failed to delete xray client: ${result?.msg || 'unknown error'}`);
    }

    console.log(`[XrayService] Deleted client ${clientUuid}`);
    return result;
  }

  /**
   * Получить статистику трафика клиента
   */
  async getClientTraffic(email) {
    const result = await this.request(
      'get',
      `/panel/api/inbounds/getClientTraffics/${email}`
    );
    return result?.obj || null;
  }
}

export default new XrayService();
