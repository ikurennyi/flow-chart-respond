const HOUR = 60 * 60 * 1000

const queryClientConfig = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        networkMode: 'always',
        staleTime: Infinity,
        gcTime: HOUR,
      },
    },
  },
}

export default queryClientConfig
