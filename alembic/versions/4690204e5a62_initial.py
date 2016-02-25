"""Initial

Revision ID: 4690204e5a62
Revises: 
Create Date: 2015-10-28 18:43:54.656000

"""

# revision identifiers, used by Alembic.
revision = '4690204e5a62'
down_revision = None
branch_labels = None
depends_on = None

from alembic import op
import sqlalchemy as sa


def upgrade():
    op.create_table(
        'event',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=32), nullable=True),
        sa.Column('visible', sa.Boolean(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'source',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('hash', sa.String(length=64), nullable=True),
        sa.Column('file_name', sa.String(length=256), nullable=True),
        sa.Column('file_ext', sa.String(length=4), nullable=True),
        sa.Column('mime_type', sa.String(length=32), nullable=True),
        sa.Column('size_bytes', sa.Integer(), nullable=True),
        sa.Column('media_type', sa.Integer(), nullable=True),
        sa.Column('youtube_hash', sa.String(length=32), nullable=True),
        sa.Column('other_url', sa.String(length=512), nullable=True),
        sa.Column('length_seconds', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('title', sa.String(length=100), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.Integer(), nullable=True),
        sa.Column('message', sa.String(length=64), nullable=True),
        sa.Column('video_codec', sa.String(length=16), nullable=True),
        sa.Column('video_bitrate', sa.Integer(), nullable=True),
        sa.Column('video_w', sa.Integer(), nullable=True),
        sa.Column('video_h', sa.Integer(), nullable=True),
        sa.Column('audio_codec', sa.String(length=16), nullable=True),
        sa.Column('audio_bitrate', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'user',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=32), nullable=True),
        sa.Column('password', sa.String(length=255), nullable=True),
        sa.Column('nickname', sa.String(length=32), nullable=True),
        sa.Column('email', sa.String(length=128), nullable=True),
        sa.Column('level', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('username')
    )
    op.create_table(
        'setting',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user', sa.Integer(), nullable=True),
        sa.Column('key', sa.String(length=32), nullable=True),
        sa.Column('value', sa.String(length=32), nullable=True),
        sa.Column('type', sa.Integer(), nullable=True),
        sa.Column('max', sa.Integer(), nullable=True),
        sa.Column('min', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['user'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'session',
        sa.Column('key', sa.String(length=32), nullable=False),
        sa.Column('user', sa.Integer(), nullable=True),
        sa.Column('start', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user'], ['user.id'], ),
        sa.PrimaryKeyConstraint('key')
    )
    op.create_table(
        'sourcequeue',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_table(
        'media',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('source', sa.Integer(), nullable=True),
        sa.Column('user', sa.Integer(), nullable=True),
        sa.Column('queue', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['queue'], ['sourcequeue.id'], ),
        sa.ForeignKeyConstraint(['source'], ['source.id'], ),
        sa.ForeignKeyConstraint(['user'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'player',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('token', sa.String(length=16), nullable=True),
        sa.Column('event', sa.Integer(), nullable=True),
        sa.Column('name', sa.String(length=32), nullable=True),
        sa.Column('last', sa.Integer(), nullable=True),
        sa.Column('status', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['event'], ['event.id'], ),
        sa.ForeignKeyConstraint(['last'], ['media.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(
        op.f('ix_player_token'),
        'player',
        ['token'],
        unique=True
    )
    op.create_table(
        'skip',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user', sa.Integer(), nullable=True),
        sa.Column('media', sa.Integer(), nullable=True),
        sa.Column('player', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['media'], ['media.id'], ),
        sa.ForeignKeyConstraint(['player'], ['player.id'], ),
        sa.ForeignKeyConstraint(['user'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user', 'media', 'player', name='_user_media_player_uc')
    )


def downgrade():
    op.drop_table('user')
    op.drop_table('sourcequeue')
    op.drop_table('source')
    op.drop_table('skip')
    op.drop_table('setting')
    op.drop_table('session')
    op.drop_index(op.f('ix_player_token'), table_name='player')
    op.drop_table('player')
    op.drop_table('media')
    op.drop_table('event')
