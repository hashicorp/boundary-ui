import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

export default class extends Helper {
  // =services
  @service clockTick;
  @service intl;

  compute([expiration_time]) {
    if (!expiration_time) return;

    // Parse the expiration time
    const expirationTime = new Date(expiration_time).getTime();

    // Get the curent time
    const currentTime = this.clockTick.now;

    // Calculate the difference in milleseconds
    const difference = expirationTime - currentTime;

    // If the difference is negative, return 0:0:00 remaining
    if (difference <= 0) return '0:0:00 remaining';

    // Calculate remaining days, hours, minutes, and seconds
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    // Create a string representing the time remaining
    let timeRemaining = '';
    if (hours > 0) timeRemaining += `${hours}:`;
    if (minutes > 0) timeRemaining += `${minutes}:`;
    if (hours === 0 && minutes === 0) {
      if (seconds > 0) timeRemaining += `${seconds} seconds remaining`;
    } else {
      timeRemaining += `${seconds} remaining`;
    }

    // Return the time remaining
    return timeRemaining;
  }
}
