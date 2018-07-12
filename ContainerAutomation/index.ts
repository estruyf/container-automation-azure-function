import Authentication from "./helpers/Authentication";
import ContainerManager from "./helpers/ContainerManager";

const MANAGEMENT_API = 'https://management.azure.com';
/**
 * Start of the timer function
 */
export = async (context, myTimer) => {
  // Get environment variables
  const { aadClientId, 
          aadClientSecret, 
          aadId, 
          subscriptionId, 
          resourceGroup, 
          containerName,
          containerGroup, 
          containerServer, 
          containerUser, 
          containerPassword } = process.env;
  
  // Get the access token to call the key vault
  const auth = new Authentication(aadId, context.log);
  const managementToken = await auth.getToken(aadClientId, aadClientSecret, MANAGEMENT_API);

  // Check if an access token was retrieved
  if (managementToken) {
    const containerMngr = new ContainerManager(managementToken, MANAGEMENT_API, context.log);
    // Check if the container instance provider exists
    const providerExists = await containerMngr.providerExist(subscriptionId);
    if (!providerExists) {
      await containerMngr.providerRegister(subscriptionId);
    }
    // Check if the container instance already exists
    const exists = await containerMngr.exists(subscriptionId, resourceGroup, containerGroup);
    if (exists) {
      // Remove the container
      await containerMngr.delete(subscriptionId, resourceGroup, containerGroup);
    }
    // Create a new container instance
    await containerMngr.create(subscriptionId, resourceGroup, containerName, containerGroup, containerServer, containerUser, containerPassword);
  }
};


