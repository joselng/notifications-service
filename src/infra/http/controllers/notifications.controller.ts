import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { SendNotification } from '@application/use-cases/send-notification';
import { CreateNotificationBody } from '../dtos/create-notification-body';
import { NotificationMapper } from '../mappers/notification-mapper';
import { CancelNotification } from '@application/use-cases/cancel-notification';
import { ReadNotification } from '@application/use-cases/read-notification';
import { UnreadNotification } from '@application/use-cases/unread-notification';
import { CountRecipientNotifications } from '@application/use-cases/count-recipient-notifications';
import { GetRecipientNotifications } from '@application/use-cases/get-recipient-notifications';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private sendNotification: SendNotification,
    private cancelNotification: CancelNotification,
    private readNotification: ReadNotification,
    private unredNotification: UnreadNotification,
    private countRecipientNotifications: CountRecipientNotifications,
    private getRecipientNotifications: GetRecipientNotifications,
  ) {}

  @Patch(':notificationId/cancel')
  async cancel(@Param('notificationId') notificationId: string) {
    await this.cancelNotification.execute({ notificationId });
  }

  @Get('count/from/:recipientId')
  async countFromRecipient(@Param(':recipientId') recipientId: string) {
    const { count } = await this.countRecipientNotifications.execute({
      recipientId,
    });

    return { count };
  }

  @Get('from/:recipientId')
  async getFromRecipient(@Param(':recipientId') recipientId: string) {
    const { notifications } = await this.getRecipientNotifications.execute({
      recipientId,
    });

    return notifications.map((notification) =>
      NotificationMapper.toHTTP(notification),
    );
  }

  @Patch(':notificationId/read')
  async read(@Param('notificationId') notificationId: string) {
    await this.readNotification.execute({ notificationId });
  }

  @Patch(':notificationId/unread')
  async unread(@Param('notificationId') notificationId: string) {
    await this.unredNotification.execute({ notificationId });
  }

  @Post()
  async create(@Body() body: CreateNotificationBody) {
    const { recipientId, content, category } = body;

    const { notification } = await this.sendNotification.execute({
      recipientId,
      content,
      category,
    });

    return NotificationMapper.toHTTP(notification);
  }
}
