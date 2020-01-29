'use strict';

const express = require('express');
const nodemailer = require('nodemailer');

const app = express();

const port = 3000;
const user = 'username';
const pass = 'password';
const domain = 'outlook.com';

var account = {
    smtp: {
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        tls: {
            ciphers: 'SSLv3'
        },
        auth: {
            type: 'custom',
            user: `${user}@${domain}`,
            pass: `${pass}`,
            options: {
                domain: 'my-domain',
                workstation: 'my-desktop'
            },
            method: 'NTLM'
        },
    },
    from: `${user}@${domain}`,
    replyTo: `reply@outlook.com.br`,
    headers: {
        'X-Laziness-level': 1000
    }
};

var payload = {
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    tls: {
        ciphers: 'SSLv3'
    },
    auth: {
        user: `${user}@${domain}`,
        pass: `${pass}`
    },
    from: `${user}@${domain}`,
    replyTo: `reply@outlook.com.br`,
    headers: {
        'X-Laziness-level': 1000 // just an example header, no need to use this
    }
};

app.get('/', (req, res) => res.send('Hello World'));

// Using example:
// http://localhost:3000/send?subject=Hello%20%E2%9C%94&html=%3Ch1%3E%3Cb%3EHello%20beautfull%20World!%3C/b%3E%3C/h1%3E
app.get('/send', (req, res) => {
    const transporter = nodemailer.createTransport({
        host: payload.host,
        port: payload.port || 587,
        secure: payload.secure || false, // false for TLS - as a boolean not string - but the default is false so just remove this completely
        auth: payload.auth,
        tls: payload.tls || { ciphers: 'SSLv3' },
        logger: false,
        debug: false // include SMTP traffic in the logs
    }, {
        from: payload.from,
        replyTo: payload.replyTo,
        headers: payload.headers
    });

    const query = req.query;
    console.log(query);

    let mailOptions = {
        to: `${user}@${domain}`,
        subject: query.subject || "Hello ✔", // Subject line
        text: query.text || "Hello World!", // plain text body
        html: query.html || "<h1><b>Hello World!</b></h1>", // html body
        amp: `<!doctype html>
                <html ⚡4email>
                <head>
                    <meta charset="utf-8">
                    <style amp4email-boilerplate>body{visibility:hidden}</style>
                    <script async src="https://cdn.ampproject.org/v0.js"></script>
                    <script async custom-element="amp-anim" src="https://cdn.ampproject.org/v0/amp-anim-0.1.js"></script>
                </head>
                <body>
                    <p><b>Hello</b> to myself <amp-img src="https://cldup.com/P0b1bUmEet.png" width="16" height="16"/></p>
                    <p>No embedded image attachments in AMP, so here's a linked nyan cat instead:<br/>
                    <amp-anim src="https://cldup.com/D72zpdwI-i.gif" width="500" height="350"/></p>
                </body>
                </html>`,
        attachments: [
            // String attachment
            {
                filename: 'notes.txt',
                content: 'Some notes about this e-mail',
                contentType: 'text/plain' // optional, would be detected from the filename
            },
            // Binary Buffer attachment
            {
                filename: 'image.png',
                content: Buffer.from(
                    'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAD/' +
                    '//+l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH8yw83NDDeNGe4U' +
                    'g9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC',
                    'base64'
                ),
                cid: 'note@example.com' // should be as unique as possible
            },
            // File Stream attachment
            {
                filename: 'Altice.png',
                path: __dirname + '/assets/altice.png',
                cid: 'nyan@example.com' // should be as unique as possible
            }
        ],
        list: {
            // List-Help: <mailto:admin@example.com?subject=help>
            help: 'admin@example.com?subject=help',

            // List-Unsubscribe: <http://example.com> (Comment)
            unsubscribe: [
                {
                    url: 'http://example.com/unsubscribe',
                    comment: 'A short note about this url'
                },
                'unsubscribe@example.com'
            ],

            // List-ID: "comment" <example.com>
            id: {
                url: 'mylist.example.com',
                comment: 'This is my awesome list'
            }
        }
    };

    transporter.sendMail(
        mailOptions
    ).then(info => {
        res.send(info);
    }).catch(err => {
        res.send(err);
    });

    // transporter.sendMail(mailOptions, (error, info) => {
    //     if (error) {
    //         console.log('Error occurred');
    //         console.log(error.message);
    //     };

    //     console.log('Message sent successfully!');
    //     console.log(nodemailer.getTestMessageUrl(info));

    //     // only needed when using pooled connections
    //     transporter.close();
    // });
});

app.listen(port, () => console.log(`Running on port ${port}!`));