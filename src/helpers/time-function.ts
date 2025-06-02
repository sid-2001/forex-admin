import moment from "moment";

export function CustomFormatTime(seconds: number) {
  if (isNaN(seconds) || seconds === null) {
    return "0";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const paddedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

  return `${minutes}m ${paddedSeconds}s`;
}

// export const formatTime = (seconds: number) => {
//   return moment.utc(seconds * t).format('HH:mm:ss');
// };

export const formatTime = (seconds: number) => {
  const duration = moment.duration(seconds, 'seconds');
  const hours = duration.hours();
  const minutes = duration.minutes();
  const secs = duration.seconds();

  let formattedTime = '';

  if (hours > 0) {
    formattedTime += `${hours}h `;
  }
  if (minutes > 0) {
    formattedTime += `${minutes}m `;
  }
  if (secs > 0) {
    formattedTime += `${secs}s`;
  }

  return formattedTime.trim();
};
