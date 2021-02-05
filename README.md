# Azure Communication Services Group Call Services

This repository is for group call on Azure Communication Services.

## Prerequisites

- [Node.js v1.14](https://nodejs.org/en/)
- [Python 3.8](https://www.python.org/)
- [Azure Functions Core Tools](https://docs.microsoft.com/ja-jp/azure/azure-functions/functions-run-local?tabs=windows%2Ccsharp%2Cbash)
- [Visual Studio Code](https://code.visualstudio.com/)
- [yarn](https://classic.yarnpkg.com/en/docs/install/#windows-stable) (Optional)

## Set Up

1. Clone This Repository
2. Run `yarn install` (or `npm install`) at repository root
3. Go to `api` folder
4. Run `python -m venv .venv`
5. Run `pip install -r requirements.txt`
6. Open `api` by VS Code
7. Create New Azure Functions Project. (`Ctrl + Shift + P` then choose `Azure Functions: Create New Project...`)

## Create Azure Resources

- [Create Azure Communication Services](https://docs.microsoft.com/en-us/azure/communication-services/quickstarts/create-communication-resource?tabs=windows&pivots=platform-azp)

Set Connection String value at `local.settings.json` after creating New Project for Azure Functions.

```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "python",
    "COMMUNICATION_SERVICES_CONNECTION_STRING": "",
  }
}
```

## Start Application

1. Run `yarn start` or `npm start`
2. Run `func host start` at api

## Reference

- [Group Calling Sample](https://github.com/Azure-Samples/communication-services-web-calling-hero)
- [ACS Calling Tutorial](https://github.com/Azure-Samples/communication-services-web-calling-tutorial)

## LICENSE

This repository is [MIT LICENSE](./LICENSE).
