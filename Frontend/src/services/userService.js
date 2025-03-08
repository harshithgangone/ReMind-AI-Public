import api from "./api"

export const createUserInMongoDB = async (uid, userData) => {
  try {
    const response = await api.post("/users", { uid, ...userData })
    return response.data
  } catch (error) {
    console.error("Error creating user in MongoDB:", error)
    throw error
  }
}

export const checkUserInMongoDB = async (uid) => {
  try {
    const response = await api.get(`/users/${uid}`)
    return response.data.exists
  } catch (error) {
    console.error("Error checking user in MongoDB:", error)
    return false
  }
}

export const updateUserInMongoDB = async (uid, userData) => {
  try {
    const response = await api.put(`/users/${uid}`, userData)
    return response.data
  } catch (error) {
    console.error("Error updating user in MongoDB:", error)
    throw error
  }
}

