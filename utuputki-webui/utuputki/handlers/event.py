# -*- coding: utf-8 -*-

from handlers.handlerbase import HandlerBase
from db import db_session, Event


class EventHandler(HandlerBase):
    def handle(self, packet_msg):
        if not self.sock.authenticated:
            return

        query = packet_msg.get('query')

        # Fetch all events. Use this to init client state
        if query == 'fetchall':
            s = db_session()
            events = [event.serialize() for event in s.query(Event).filter_by(visible=True).all()]
            s.close()
            self.send_message(events)