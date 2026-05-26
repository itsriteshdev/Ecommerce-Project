const db = require('../config/db');
const { AppError } = require('../middlewares/errorHandler');
const { toNotificationDto } = require('../utils/dtoMapper');

const getUserNotifications = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const notifyRes = await db.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    const result = notifyRes.rows.map(toNotificationDto);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  const userId = req.user.id;
  const { notificationId } = req.params;

  try {
    const notifyRes = await db.query('SELECT user_id FROM notifications WHERE id = $1', [notificationId]);
    if (notifyRes.rows.length === 0) {
      return next(new AppError('Notification not found with id: ' + notificationId, 404));
    }

    if (parseInt(notifyRes.rows[0].user_id, 10) !== userId) {
      return next(new AppError('You are not authorized to access this notification', 403));
    }

    await db.query('UPDATE notifications SET is_read = true WHERE id = $1', [notificationId]);
    
    res.ok = true; // logged
    res.json('Notification marked as read');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUserNotifications,
  markAsRead
};
