from wss.consumer import set_ws_send_data, send_websocket_message


def send_change_ws_message(room_id, user, sender='system', message_type='onchange'):
	ws_data = set_ws_send_data(sender, message_type, {
		'userId': user.pk,
		'owner': user.owner,
		'role': user.role,
		'profileIconId': user.profile,
		'gameName': user.game_name,
		'tag': user.tag,
		'rank': user.rank,
		'most': user.most,
		'lane': user.lane
	})
	send_websocket_message(room_id, ws_data)
	