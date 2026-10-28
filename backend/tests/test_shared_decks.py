import pytest


def headers(client, email):
    response = client.post('/api/auth/register', json={
        'email': email, 'password': 'Shared-deck-test-123', 'display_name': email.split('@')[0],
    })
    assert response.status_code == 201
    return {'Authorization': f"Bearer {response.json()['access_token']}"}


def payload(public=True):
    return {'title': 'Testa kopa', 'isPublic': public, 'cards': [
        {'id': f'k{i}', 'question': f'Jautājums {i}', 'answer': f'Atbilde {i}'} for i in range(5)
    ]}


def test_public_deck_is_visible_to_another_account_and_survives_new_request(client):
    owner = headers(client, 'owner@example.com')
    friend = headers(client, 'friend@example.com')
    saved = client.put('/api/decks/d-test', headers=owner, json=payload())
    assert saved.status_code == 200
    assert saved.json()['revision'] == 1
    visible = client.get('/api/decks', headers=friend).json()
    assert len(visible) == 1
    assert visible[0]['title'] == 'Testa kopa'
    assert visible[0]['cards'][0]['answer'] == 'Atbilde 0'
    assert visible[0]['canEdit'] is False
    assert visible[0]['author'] == 'owner'
    assert client.get('/api/decks/d-test', headers=owner).json()['canEdit'] is True


def test_private_deck_and_mutations_are_owner_only(client):
    owner = headers(client, 'owner@example.com')
    friend = headers(client, 'friend@example.com')
    assert client.put('/api/decks/d-private', headers=owner, json=payload(False)).status_code == 200
    assert client.get('/api/decks', headers=friend).json() == []
    assert client.get('/api/decks/d-private', headers=friend).status_code == 404
    assert client.put('/api/decks/d-private', headers=friend, json=payload()).status_code == 403
    assert client.delete('/api/decks/d-private?revision=1', headers=friend).status_code == 403
    assert client.get('/api/decks/d-private', headers=owner).status_code == 200


def test_update_conflict_does_not_overwrite_and_private_change_removes_from_search(client):
    owner = headers(client, 'owner@example.com')
    friend = headers(client, 'friend@example.com')
    client.put('/api/decks/d-test', headers=owner, json=payload())
    changed = {**payload(False), 'title': 'Mainīta kopa', 'revision': 1}
    assert client.put('/api/decks/d-test', headers=owner, json=changed).json()['revision'] == 2
    assert client.put('/api/decks/d-test', headers=owner, json={**changed, 'title': 'Vecā cilne'}).status_code == 409
    assert client.get('/api/decks/d-test', headers=owner).json()['title'] == 'Mainīta kopa'
    assert client.get('/api/decks', headers=friend).json() == []
    assert client.delete('/api/decks/d-test?revision=1', headers=owner).status_code == 409
    assert client.delete('/api/decks/d-test?revision=2', headers=owner).status_code == 200
    assert client.get('/api/decks', headers=owner).json() == []
    assert client.put('/api/decks/d-test', headers=owner, json=payload()).status_code == 410
    assert client.get('/api/decks/d-test', headers=owner).status_code == 404


@pytest.mark.parametrize('change', [
    {'title': '  '}, {'cards': []}, {'category': 'invalid'},
    {'cards': [{'id': 'same', 'question': 'Q', 'answer': 'A'}] * 5},
])
def test_deck_validation_and_authentication(client, change):
    assert client.get('/api/decks').status_code == 401
    owner = headers(client, 'owner@example.com')
    assert client.put('/api/decks/d-test', headers=owner, json={**payload(), **change}).status_code == 422
