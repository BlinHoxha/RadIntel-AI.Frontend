window.config = {
  routerBasename: '/',
  extensions: [],
  modes: [],
  showStudyList: false,
  showWarningMessageForCrossOrigin: false,
  showCPUFallbackMessage: false,
  showLoadingIndicator: true,
  maxNumberOfWebWorkers: 1,
  maxCacheSize: 67108864,
  maxNumRequests: { interaction: 2, thumbnail: 1, prefetch: 0 },
  defaultDataSourceName: 'dicomjson',
  dataSources: [
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomjson',
      sourceName: 'dicomjson',
      configuration: {
        friendlyName: 'Synthetic RadIntel proof',
        name: 'radintel',
        imageRendering: 'wadouri',
        thumbnailRendering: 'wadouri',
        enableStudyLazyLoad: false,
      },
    },
  ],
};
