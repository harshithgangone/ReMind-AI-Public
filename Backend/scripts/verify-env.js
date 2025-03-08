import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") })

// Required environment variables
const requiredEnvVars = ["OPENAI_API_KEY", "ELEVENLABS_API_KEY", "ELEVENLABS_VOICE_ID", "MONGODB_URI"]

// Check if required environment variables are set
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.error("Error: The following required environment variables are missing:")
  missingEnvVars.forEach((envVar) => {
    console.error(`- ${envVar}`)
  })
  console.error("\nPlease add them to your .env file.")
  process.exit(1)
} else {
  console.log("All required environment variables are set.")

  // Print the first few characters of each key to verify they're loaded correctly
  requiredEnvVars.forEach((envVar) => {
    const value = process.env[envVar]
    const displayValue = value ? `${value.substring(0, 5)}...` : "undefined"
    console.log(`${envVar}: ${displayValue}`)
  })
}

