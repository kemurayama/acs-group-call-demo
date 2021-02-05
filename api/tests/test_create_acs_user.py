import json
import pytest
from pytest_mock import MockerFixture
import azure.functions as func

from create_acs_user import main

@pytest.mark.asyncio
async def test_create_acs_user(mocker: MockerFixture) -> None:

    mock_name = "dummy_name"
    mock_id = "guid"
    mock_acs_id = "acs_id"
    mocker.patch('os.environ.get').return_value
    mocker.patch('create_acs_user.CommunicationIdentityClient')
    mocker.patch('azure.functions.Out')

    mock_request_body = {
        'name': mock_name
    }

    mock_request = func.HttpRequest(
        'POST',
        'http://localhost:7071/api/create_acs_user',
        headers={'Content-Type': 'application/json'},
        params=None,
        body=json.dumps(mock_request_body).encode('utf-8')
    )
    mock_response_body = {
        'id': mock_id,
        'name': mock_name,
        'acs_id': mock_acs_id
    }
    mock_response = func.HttpResponse(
        body=json.dumps(mock_response_body).encode('utf-8'),
        status_code=200,
        headers={'Content-Type': 'application/json'}
    )

    mocker.patch('uuid.uuid4').return_value = mock_id

    async with mocker.patch('create_acs_user.CommunicationIdentityClient.from_connection_string').return_value as mock_communication_client:
        mock_communication_client.create_user.return_value = mocker.Mock(identifier=mock_acs_id)
        response = await main(mock_request)
        assert response.get_body() == mock_response.get_body()
