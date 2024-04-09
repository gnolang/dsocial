import { colors } from "@gno/styles/colors";
import Text from "../text";

function TimeStampLabel({ timestamp }: { timestamp: string }) {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const formattedHours = hours < 10 ? `0${hours}` : hours;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const formattedDay = day < 10 ? `0${day}` : day;
  const formattedMonth = month < 10 ? `0${month}` : month;

  return (
    <Text.Caption1 style={{ color: colors.text.secondary }}>
      {`${formattedHours}:${formattedMinutes} ${formattedDay}/${formattedMonth}/${year}`}
    </Text.Caption1>
  );
}

export default TimeStampLabel;
