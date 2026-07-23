"use server";

import webpush from 'web-push';
import { prisma } from '@/lib/prisma';
import { checkSession } from '@/app/actions/session';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:test@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export async function saveSubscription(subscription: any) {
  const session = await checkSession();
  if (!session?.userId) return { success: false, error: "Not logged in" };

  try {
    // Upsert the subscription using the endpoint as the unique identifier
    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        userId: session.userId,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      create: {
        userId: session.userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      }
    });
    return { success: true };
  } catch (error) {
    console.error('Error saving subscription:', error);
    return { success: false, error: 'Failed to save subscription' };
  }
}

export async function sendPushNotification(userId: string, title: string, body: string, url: string = '/') {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId }
    });

    const payload = JSON.stringify({
      title,
      body,
      url,
    });

    const sendPromises = subscriptions.map(sub => {
      const pushSub = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        }
      };
      
      return webpush.sendNotification(pushSub, payload).catch(err => {
        if (err.statusCode === 404 || err.statusCode === 410) {
          console.log('Subscription has expired or is no longer valid: ', err);
          return prisma.pushSubscription.delete({ where: { id: sub.id } });
        } else {
          throw err;
        }
      });
    });

    await Promise.allSettled(sendPromises);
    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: 'Failed to send notification' };
  }
}
