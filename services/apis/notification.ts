import restful from './restful';

export const getNotifications = async (cursor?: number | null) => {
  // cursor가 유효한 숫자인지 확인
  const queryParams = cursor ? `?cursorId=${cursor}` : '';

  const response = await restful(
    'GET',
    `notification/api/notifications${queryParams}`,
    {},
    {
      isAuth: true,
    },
  );

  if (response) {
    return response.data;
  }
  throw new Error(response.message || '알림 조회에 실패했습니다.');
};

export const readNotification = async (notificationId: string) => {
  // notificationId가 유효한 숫자인지 확인
  if (
    !notificationId ||
    typeof notificationId !== 'number' ||
    isNaN(notificationId) ||
    notificationId <= 0
  ) {
    throw new Error('유효하지 않은 알림 ID입니다.');
  }

  const response = await restful(
    'PUT',
    `notification/api/notifications/${notificationId}`,
    {},
    {
      isAuth: true,
    },
  );
  if (response) {
    return response.data;
  }
  throw new Error(response.message || '알림 읽음 처리에 실패했습니다.');
};
