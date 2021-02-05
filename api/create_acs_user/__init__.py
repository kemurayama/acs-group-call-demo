import os
import logging
import json

import uuid
import azure.functions as func
from azure.communication.administration.aio import CommunicationIdentityClient


async def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    req_body = req.get_json()

    connection_string = os.environ.get('COMMUNICATION_SERVICES_CONNECTION_STRING')
    async with CommunicationIdentityClient.from_connection_string(connection_string) as client:
        identity = await client.create_user()
        logging.info(f'Function Created User with ID: {identity.identifier}')

        user_id = str(uuid.uuid4())
        result = {
            'id': user_id,
            'name': req_body['name'],
            'acs_id': identity.identifier
        }

        return func.HttpResponse(
            body=json.dumps(result),
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
