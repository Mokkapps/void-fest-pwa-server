const admin = require('firebase-admin');
const moment = require('moment-timezone');
const { interval } = require('rxjs');
const { map } = require('rxjs/operators');

function EventMessageSender(topicName, events) {
  return {
    start: () => {
      interval(60 * 1000)
        .pipe(map(() => moment().tz('Europe/Berlin')))
        .subscribe(date => {
          const day = date.date();
          const month = date.month() + 1;
          const year = date.year();
          const hour = date.hour();
          const minute = date.minute();
          const dateString = `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;

          console.log('[EventMessageSender] interval tick:', dateString);

          for (const event of events) {
            const eventDate = event.date;
            const eventStart = event.time.split('-')[0].split(':');
            const eventStartHour = eventStart[0];
            const eventStartMinute = eventStart[1];

            const isToday = eventDate === dateString;
            const isNowTheTime = Number(eventStartHour) === hour && Number(eventStartMinute) === minute;

            if (isToday && isNowTheTime) {
              admin
                .messaging()
                .send({
                  data: {
                    band: event.band,
                    stage: event.stage,
                    time: event.time.split('-')[0]
                  },
                  topic: topicName
                })
                .then(response => {
                  // Response is a message ID string.
                  console.log(`Successfully sent message to topic "${topicName}":`, response);
                })
                .catch(error => {
                  console.error('Error sending message:', error);
                });
            }
          }
        });
    }
  };
}

module.exports = EventMessageSender;
