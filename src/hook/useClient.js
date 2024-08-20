import { useClient as useSanityClient, type SanityClient } from 'sanity'

export const useClient = () => {
  return useSanityClient({ apiVersion: '2022-09-14' })
}
