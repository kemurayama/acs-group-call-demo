import logging
import os
import json
import azure.functions as func
from azure.communication.administration._shared.models import CommunicationUser
from azure.communication.administration.aio import CommunicationIdentityClient


async def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    try:
        req_body = req.get_json()
    except ValueError as e:
        return func.HttpResponse(
            'This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.',
            status_code=400
        )

    # Initialize Client
    conn = os.environ.get('COMMUNICATION_SERVICES_CONNECTION_STRING')
    user = CommunicationUser(req_body['acs_id'])

    async with CommunicationIdentityClient.from_connection_string(conn) as client:
        token_result = await client.issue_token(user, ['voip'])
        response = {
            'access_token': token_result.token
        }

        return func.HttpResponse(
            body=json.dumps(response),
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
