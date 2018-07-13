# Azure Container Automation with Azure Functions

## Prerequisites

In order to run this project you will have to install the [Azure Functions Core Tools](https://github.com/Azure/azure-functions-core-tools).

Once that is installed, the following Azure setup is required:

- Azure Container Registry for storing your private container. More information about creating one via the Azure CLI can be found here: [Create a container registry using the Azure CLI](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-get-started-azure-cli)

```
containerRg = "<resource-group-name>"
acrName = "<registry-name>"

az group create --name $containerRg --location westeu
az acr create --resource-group $containerRg --name $acrName --sku Basic --admin-enabled true

# Container server name -> store in local.settings.json
az acr show --name $acrName --query loginServer --output table

# Container username is the part before azurecr.io => <username>.azurecr.io -> store in local.settings.json

# Container password -> store in local.settings.json
az acr credential show --name $acrName --query "passwords[0].value"
```

- Deploy your container to the registry
- Create an Azure AD APP
  - Store the client ID in the local.settings.json
  - Create a client secret -> store this in the local.settings.json
  - Add the Windows Azure Service Management API to the required permissions (only one delegate scope)
  - Click grant permissions
- Give the Azure AD App - contribute permissions on the following resources:
  - Resource Group
  - Azure Container Registry

## Local development

In order to run this project locally, it is best to open two terminals.

**Terminal 1**:

- Run `npm run unpack` to undo the production bundle
- Run `npm run tsc:watch` and keep this open in the background


**Terminal 2**: 
- Run `func host start` whenever you want to test the Azure Function

## Ready for production

Once the code is ready to be pushed to production, run the following command: `npm run build`.

This will transpile the TypeScript files to JavaScript and creates a bundle of all required files with [Azure Functions Pack](https://github.com/Azure/azure-functions-pack). This process can also be done via KUDU, but it's much faster when you run it from your own machine.