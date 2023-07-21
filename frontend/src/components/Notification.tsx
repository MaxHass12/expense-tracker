const Notification = (props: { message: string | null }) => {
  if (props.message === null) {
    return null;
  }

  return <div className="notification">{props.message}</div>;
};

export default Notification;
