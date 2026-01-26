require('dotenv').config();

module.exports = {
  expo: {
    name: 'PollStraw',
    slug: 'pollstraw',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/favicon.png',
    userInterfaceStyle: 'automatic',
    scheme: 'pollstraw',
    splash: {
      image: './assets/favicon.png',
      resizeMode: 'contain',
      backgroundColor: '#0ea5e9',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.pollstraw.mobile',
      associatedDomains: [
        'applinks:pollstraw.com',
        'applinks:www.pollstraw.com',
      ],
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/favicon.png',
        backgroundColor: '#0ea5e9',
      },
      package: 'com.pollstraw.mobile',
      permissions: ['android.permission.DETECT_SCREEN_CAPTURE'],
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'pollstraw.com',
              pathPrefix: '/poll',
            },
            {
              scheme: 'https',
              host: 'www.pollstraw.com',
              pathPrefix: '/poll',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      apiUrl: process.env.API_URL || 'http://localhost:3000/api',
      socketUrl: process.env.SOCKET_URL || 'http://localhost:3000',
      eas: {
        projectId: '1675c5e3-2b73-461f-908c-eb2a16d62e60',
      },
    },
  },
};
