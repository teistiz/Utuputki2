# -*- coding: utf-8 -*-

import logging
from sqlalchemy import func

from handlerbase import HandlerBase
from common.db import db_session, Skip, User, Media

log = logging.getLogger(__name__)


class StatsHandler(HandlerBase):
    def handle(self, packet_msg):
        if not self.is_user_auth():
            return

        if self.query == 'fetch_ratings':
            s = db_session()
            # We probably _could_ combine these queries.
            # Count skips received by media posted by users
            skips_recv = s.query(User, Media, Skip, func.count()).\
                filter(Media.user == User.id).\
                filter(Media.id == Skip.media).\
                group_by(User.id)
            # Count skip requests issued by users
            skips_sent = s.query(User, Skip, func.count()).\
                filter(User.id == Skip.user).\
                group_by(User.id)
            # Count total posts by each user
            posts = s.query(User, Media, func.count()).\
                filter(Media.user == User.id).\
                group_by(User.id)
            s.close()
            names_by_id = {}        # relevant users
            skips_recv_by_id = {}   # # of skips received by userid's media
            skips_sent_by_id = {}   # skips sent per user id
            posts_by_id = {}        # posts per user id
            collated = []
            for s in skips_recv.all():
                user = s[0]
                userid = s[0].id
                if userid not in names_by_id:
                    names_by_id[userid] = user.username
                skips_recv_by_id[userid] = s[3]  # get value of func.count()
            for s in skips_sent.all():
                user = s[0]
                userid = user.id
                if userid not in names_by_id:
                    names_by_id[userid] = user.username
                skips_sent_by_id[userid] = s[2]
            for p in posts.all():
                user = p[0]
                userid = user.id
                if userid not in names_by_id:
                    names_by_id[userid] = user.username
                posts_by_id[userid] = p[2]
            for userid in names_by_id:
                name = names_by_id[userid]
                skips_recv = skips_recv_by_id.get(userid, 0)
                skips_sent = skips_sent_by_id.get(userid, 0)
                posts = posts_by_id.get(userid, 0)
                collated.append((
                    name, skips_recv, skips_sent,
                    posts, float(skips_recv) / posts if posts > 0 else 0))
            out = []
            k = 1
            for c in collated:
                out.append({
                    'number': k,
                    'name': c[0],
                    'skips_sent': c[1],
                    'skips_recv': c[2],
                    'posts': c[3],
                    'rating': c[4],
                })
                k += 1
            self.send_message(out)
