import * as request from "request-promise";

export default class ContainerManager {

  constructor (private accessToken: string, private managementApi: string, private log: any) {}
  
  /**
   * Check if the container instance provider is registered for your subscription
   * 
   * @param subId 
   */
  public async providerExist(subId: string) {
    try {
      const apiUrl: string = `${this.managementApi}/subscriptions/${subId}/providers?api-version=2018-02-01`;

      // Do the delete call
      const result = await request.get(apiUrl, {
        headers: {
          "Authorization": `Bearer ${this.accessToken}`
        }
      });
      if (result && typeof result === "string") {
        const providers = JSON.parse(result);
        if (providers && providers.value) {
          for (const provider of providers.value) {
            if (provider.namespace === "Microsoft.ContainerInstance") {
              if (provider.registrationState === "Registered") {
                return true;
              } else {
                return false;
              }
            }
          }
        }
        return false;
      }
      this.log.info(`Container instance provider does not exist`);
      return false;
    } catch (e) {
      // Container instance provider did not exists
      this.log.info(`Container instance provider does not exist`);
      return false;
    }
  }

  /**
   * Register the Azure provider to be used in your subscription
   * 
   * @param subId 
   */
  public async providerRegister(subId: string) {
    try {
      const apiUrl: string = `${this.managementApi}/subscriptions/${subId}/providers/Microsoft.ContainerInstance/register?api-version=2018-02-01`;

      // Do the delete call
      const result = await request.post(apiUrl, {
        headers: {
          "Authorization": `Bearer ${this.accessToken}`
        }
      });
      if (result && typeof result === "string") {
        return true
      }
      this.log.info(`Container instance provider not correctly registered`);
      return false;
    } catch (e) {
      // Container instance provider did not exists
      this.log.info(`Container instance provider not correctly registered`);
      return false;
    }
  }

  /**
   * Check if the container exists
   * 
   * @param subId 
   * @param rg 
   * @param cg 
   */
  public async exists(subId: string, rg: string, cg: string) {
    try {
      const apiUrl: string = this.getUrl(subId, rg, cg);

      // Do the delete call
      const result = await request.get(apiUrl, {
        headers: {
          "Authorization": `Bearer ${this.accessToken}`
        }
      });
      if (result && typeof result === "string") {
        const cResult = JSON.parse(result);
        if (cResult.name === cg) {
          this.log.info(`Container exists`);
          return true;
        }
      }
      this.log.info(`Container does not exist`);
      return false;
    } catch (e) {
      // Container did not exists
      this.log.info(`Container does not exist`);
      return false;
    }
  }

  /**
   * Deletes the container
   * 
   * @param subId subscription ID
   * @param rg resource group name
   * @param cg container group name
   */
  public async delete(subId: string, rg: string, cg: string) {
    try {
      const apiUrl: string = this.getUrl(subId, rg, cg);

      // Do the delete call
      await request.delete(apiUrl, {
        headers: {
          "Authorization": `Bearer ${this.accessToken}`
        }
      });
      this.log.info(`Container deleted`);
    } catch (e) {
      // Container did not exists, or another error occurred
      this.log.error(e);
    }
  }

  /**
   * Creates a new container
   * 
   * @param subId 
   * @param rg 
   * @param cg
   * @param containerName 
   * @param containerServer 
   * @param containerUser 
   * @param containerPwd 
   */
  public async create(subId: string, rg: string, cg: string, containerName: string, containerServer: string, containerUser: string, containerPwd: string) {
    const apiUrl = this.getUrl(subId, rg, cg);

    await request.put(apiUrl, {
      headers: {
        "Authorization": `Bearer ${this.accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        location: "westeurope",
        properties: {
          containers: [{
            name: cg,
            properties: {
              image: containerName,
              environmentVariables: [],
              resources: {
                requests: {
                  memoryInGB: 1.0,
                  cpu: 1.0
                }
              }
            }
          }],
          imageRegistryCredentials: [{
            server: containerServer,
            username: containerUser,
            password: containerPwd
          }],
          restartPolicy: "OnFailure",
          osType: "Linux"
        }
      })
    });
    this.log.info(`Container request completed`);
  }

  /**
   * Get the API to create or delete a container
   * 
   * @param subId subscription ID
   * @param rg resource group name
   * @param cg container group name
   */
  private getUrl(subId: string, rg: string, cg: string): string {
    return `${this.managementApi}/subscriptions/${subId}/resourceGroups/${rg}/providers/Microsoft.ContainerInstance/containerGroups/${cg}?api-version=2018-02-01-preview`
  }
}