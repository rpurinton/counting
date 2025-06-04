import { jest } from '@jest/globals';
import messageCreate from '../../src/events/messageCreate.mjs';

const makeMockMessage = (overrides = {}) => ({
    author: { id: 'user1', bot: false },
    content: '1',
    guild: { preferredLocale: 'en-US' },
    channel: { id: 'chan1', type: 0 },
    id: 'msg1',
    reply: jest.fn(),
    ...overrides,
});

describe('messageCreate event', () => {
    let db, log, getMsg;
    beforeEach(() => {
        db = {
            query: jest.fn()
        };
        log = { debug: jest.fn() };
        getMsg = jest.fn((locale, key) => key + '_msg');
    });

    it('ignores bot messages', async () => {
        const msg = makeMockMessage({ author: { id: 'bot', bot: true } });
        await messageCreate(msg, db, log, getMsg);
        expect(db.query).not.toHaveBeenCalled();
    });

    it('ignores non-numeric messages', async () => {
        const msg = makeMockMessage({ content: 'hello' });
        await messageCreate(msg, db, log, getMsg);
        expect(db.query).not.toHaveBeenCalled();
    });

    it('starts new state if none exists', async () => {
        db.query.mockImplementationOnce(() => Promise.resolve([[]]))
            .mockImplementationOnce(() => Promise.resolve());
        const msg = makeMockMessage();
        await messageCreate(msg, db, log, getMsg);
        expect(db.query).toHaveBeenCalledWith(
            'INSERT INTO counting_state (channel_id, current_count, last_user_id, last_message_id) VALUES (?, 0, NULL, NULL)',
            [msg.channel.id]
        );
    });

    it('resets if user counts twice', async () => {
        db.query.mockResolvedValueOnce([[{ channel_id: 'chan1', current_count: 0, last_user_id: 'user1', last_message_id: 'msg0' }]]);
        const msg = makeMockMessage();
        await messageCreate(msg, db, log, getMsg);
        expect(db.query).toHaveBeenCalledWith(
            'UPDATE counting_state SET current_count = 0, last_user_id = ?, last_message_id = ? WHERE channel_id = ?',
            [msg.author.id, msg.id, msg.channel.id]
        );
        expect(msg.reply).toHaveBeenCalledWith('count_twice_error_msg');
    });

    it('resets if wrong number', async () => {
        db.query.mockResolvedValueOnce([[{ channel_id: 'chan1', current_count: 2, last_user_id: 'user2', last_message_id: 'msg0' }]]);
        const msg = makeMockMessage({ content: '5', author: { id: 'user1', bot: false } });
        await messageCreate(msg, db, log, getMsg);
        expect(db.query).toHaveBeenCalledWith(
            'UPDATE counting_state SET current_count = 0, last_user_id = ?, last_message_id = ? WHERE channel_id = ?',
            [msg.author.id, msg.id, msg.channel.id]
        );
        expect(msg.reply).toHaveBeenCalledWith('wrong_number_error_msg');
    });

    it('updates state and sends celebration on 10th count', async () => {
        db.query.mockResolvedValueOnce([[{ channel_id: 'chan1', current_count: 9, last_user_id: 'user2', last_message_id: 'msg0' }]]);
        const msg = makeMockMessage({ content: '10', author: { id: 'user1', bot: false } });
        getMsg = jest.fn(() => '🎉 Congratulations! The count is now {num}!');
        await messageCreate(msg, db, log, getMsg);
        expect(db.query).toHaveBeenCalledWith(
            'UPDATE counting_state SET current_count = ?, last_user_id = ?, last_message_id = ?, updated_at = CURRENT_TIMESTAMP WHERE channel_id = ?',
            [10, msg.author.id, msg.id, msg.channel.id]
        );
        expect(msg.reply).toHaveBeenCalledWith('🎉 Congratulations! The count is now 10!');
    });
});
