import { websiteName } from './../../config/website'
export const fetchInit = async (host) => {
	return {
		storeOne: {
			id: 'Medusa',
			_id: 'Medusa',
			websiteName
		}
	}
}

//  test
// export const fetchInit = async (host) => {
//   const res = await fetch(`http://localhost:9000/store`, {
//     headers: {
//       'x-publishable-api-key': 'pk_fd30032a2deebdebf93cec580fe0288a275d72ff64a016b217257fc0e0481221'
//     }
//   })
//   const json = await res.json()
//   console.log('init-service json -> ', json)
//   return { storeOne: json }
// }