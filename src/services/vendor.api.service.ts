// import api1 from "./apis/api1";

// export default class VendorApiService {
//   // Use this to get all records for the grid
//   async getAll() {
//     const { data } = await api1.get("/api/static-table/vendor-api/getAll");
//     return data;
//   }

//   // Updated to be more robust and match your working URL exactly
//   async getFiltered(vendorCode: string, urlCode: string, country: string, currency: string) {
//     try {
//       const { data } = await api1.get("/api/static-table/vendor-api/fetch", {
//         params: {
//           vendorCode,
//           urlCode,
//           country,
//           currency
//         }
//       });
//       return data;
//     } catch (error: any) {
//       console.error("API Fetch Error:", error.response?.data || error.message);
//       return error.response?.data; // Return the actual error message from server
//     }
//   }

//   async create(payload: any) {
//     const { data } = await api1.post("/api/static-table/vendor-api/create", payload);
//     return data;
//   }

//   // Note: Ensure your backend uses the ID or the code for updates
//   async update(id: string, payload: any) {
//     const { data } = await api1.put(`/api/static-table/vendor-api/update/${id}`, payload);
//     return data;
//   }

//   async delete(vendorCode: string, urlCode: string) {
//     const { data } = await api1.delete(`/api/static-table/vendor-api/delete`, {
//       params: { vendorCode, urlCode }
//     });
//     return data;
//   }
// }

import api1 from "./apis/api1";

export default class VendorApiService {
  // Temporarily using getFiltered logic with static params to avoid 500 error
  async getAll() {
    try {
      const { data } = await api1.get("/api/static-table/vendor-api/fetch", 
        //@ts-ignore
        {
        params: {
          vendorCode: 'VC004',
          urlCode: 'U002',
          country: 'NG',
          currency: 'NGN'
        }
      });
      
      // If the API returns a single object instead of an array, wrap it in an array for DataGrid
      if (data && !Array.isArray(data)) {
        return [data]; 
      }
      return data;
    } catch (error: any) {
      console.error("GetAll (via Fetch) failed:", error.response?.data || error.message);
      return []; // Return empty array so DataGrid doesn't crash
    }
  }

  async getFiltered(vendorCode: string, urlCode: string, country: string, currency: string) {
    const { data } = await api1.get("/api/static-table/vendor-api/fetch", 
      //@ts-ignore
      {
      //@ts-ignore
      params: { vendorCode, urlCode, country, currency }
    });
    return data;
  }

  async create(payload: any) {
    const { data } = await api1.post("/api/static-table/vendor-api/create", payload);
    return data;
  }

  async update(id: string, payload: any) {
    const { data } = await api1.put(`/api/static-table/vendor-api/update/${id}`, payload);
    return data;
  }
}