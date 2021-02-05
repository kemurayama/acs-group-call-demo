import json
import pytest
from pytest_mock import MockerFixture
import azure.functions as func

from issue_voip_token import main


@pytest.mark.asyncio
async def test_issue_voip_token(mocker: MockerFixture) -> None:
    """Test case for issue_voip_token"""

    # values
    mock_token = "dummy_token"
    mock_acs_id = "dummy_id"

    mocker.patch('os.environ.get').return_value
    mocker.patch('issue_voip_token.CommunicationUser')
    mocker.patch('issue_voip_token.CommunicationIdentityClient')
    mock_request_body = {
        'acs_id': mock_acs_id
    }
    mock_request = func.HttpRequest(
        'POST',
        'http://localhost:7071/api/issue_voip_token',
        headers={'Content-Type': 'application/json'},
        params=None,
        body=json.dumps(mock_request_body).encode('utf-8')
    )
    mock_response_body = {
        'access_token': mock_token
    }
    mock_response = func.HttpResponse(
        body=json.dumps(mock_response_body).encode('utf-8'),
        status_code=200,
        headers={'Content-Type': 'application/json'}
    )

    async with mocker.patch('issue_voip_token.CommunicationIdentityClient.from_connection_string').return_value as mock_communication_client:
        mock_communication_client.issue_token.return_value = mocker.Mock(token=mock_token)
        response = await main(mock_request)
        assert response.get_body() == mock_response.get_body()
