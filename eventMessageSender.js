const admin = require('firebase-admin');
const moment = require('moment-timezone');
const { interval } = require('rxjs');
const { map } = require('rxjs/operators');

const REMIND_MINUTES_BEFORE = 30;
const TIMEZONE = 'Europe/Berlin';

function areSame(m1, m2) {
  return (
    m1.date() === m2.date() &&
    m1.month() === m2.month() &&
    m1.year() === m2.year() &&
    m1.hour() === m2.hour() &&
    m1.minute() === m2.minute()
  );
}

function EventMessageSender(topicName, events) {
  return {
    start: () => {
      interval(60 * 1000)
        .pipe(map(() => moment().tz(TIMEZONE)))
        .subscribe(now => {
          console.log('[EventMessageSender] interval tick:', now.toLocaleString());

          for (const event of events) {
            const eventDate = moment(event.date).tz(TIMEZONE);
            const reminderDate = eventDate.clone().subtract(REMIND_MINUTES_BEFORE, 'minutes');

            console.log(
              'areSame',
              event,
              now.toLocaleString(),
              reminderDate.toLocaleString(),
              areSame(now, reminderDate)
            );

            if (areSame(now, reminderDate)) {
              const messageData = {
                band: event.band,
                stage: event.stage,
                time: event.time.split('-')[0]
              };
              const topic = `${topicName}-${event.id}`;

              admin
                .messaging()
                .send({
                  data: messageData,
                  topic
                })
                .then(response => {
                  // Response is a message ID string.
                  console.log(
                    `Successfully sent message to topic "${topic} with data "${JSON.stringify(
                      messageData
                    )}":`,
                    response
                  );
                })
                .catch(error => {
                  console.error(
                    `Error sent message to topic "${topic} with data "${JSON.stringify(
                      messageData
                    )}":`,
                    error
                  );
                });
            }
          }
        });
    }
  };
}

module.exports = EventMessageSender;
