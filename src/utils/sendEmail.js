const { SendEmailCommand } =  require("@aws-sdk/client-ses");
const { sesClient } = require("../utils/sesClient");

const createSendEmailCommand = (toAddress, fromAddress ,subject,body) => {
  
  return new SendEmailCommand({
    Destination: {
      CcAddresses: [
       
      ],
      ToAddresses: [
        toAddress,
       
      ],
    },
    Message: {
     
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `<h1>${body}</h1>` ,
        },
        Text: {
          Charset: "UTF-8",
          Data: "this is a text format",
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: `<h1>${subject}</h1>` ,
      },
    },
    Source: fromAddress,
    ReplyToAddresses: [
      /* more items */
    ],
  });
};

const run = async (subject,body) => {
  const sendEmailCommand = createSendEmailCommand(
    "gauravtomar977@gmail.com",
    "gaurav@gauravdevsocial.site",
     subject,
     body
  );

  try {
    
    return await sesClient.send(sendEmailCommand);
  } catch (caught) {
    if (caught instanceof Error && caught.name === "MessageRejected") {
      const messageRejectedError = caught;
      return messageRejectedError;
    }
    throw caught;
  }
  
};

module.exports = { run };