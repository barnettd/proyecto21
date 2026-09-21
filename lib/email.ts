/**
 * Mail de apertura de un día. Dos versiones en el mismo envío: HTML y texto
 * plano. La marca va escrita como texto (nada de imágenes remotas: Gmail las
 * bloquea hasta que la persona las habilita, y el mail llegaría descabezado).
 */

const CARBON = '#111111'
const BLANCO = '#F8F8F6'
const AMBAR = '#C99745'
const GRIS = '#9A9A96'
const STACK = "Montserrat, 'Helvetica Neue', Helvetica, Arial, sans-serif"

export type DayEmail = {
  subject: string
  /** Línea principal. */
  lead: string
  /** Renglón chico sobre cuánto lleva. Opcional. */
  estimate?: string
  /** Sin botón cuando el paso del día no es digital. */
  cta?: string
  url: string
  /** Renglón chico al pie, para el link cuando no hay botón. */
  note?: string
}

export function buildDayEmail(mail: DayEmail): { subject: string; html: string; text: string } {
  const { subject, lead, estimate, cta, url, note } = mail

  const text = [
    'PROYECTO 21',
    '',
    lead,
    ...(estimate ? ['', estimate] : []),
    ...(cta ? ['', `${cta}: ${url}`] : []),
    ...(note ? ['', note] : []),
    '',
    'P.21',
  ].join('\n')

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${CARBON};color:${BLANCO};">
<!-- Vista previa en la bandeja, invisible en el cuerpo. -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escape(lead.split('\n').join(' '))}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CARBON};">
  <tr>
    <td align="center" style="padding:40px 20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;">
        <tr>
          <td style="font-family:${STACK};font-size:22px;font-weight:700;letter-spacing:0.18em;color:${BLANCO};padding-bottom:14px;">
            PROYECTO&nbsp;<span style="font-weight:800;">21</span>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom:28px;">
            <div style="height:2px;width:56px;background:${AMBAR};font-size:0;line-height:0;">&nbsp;</div>
          </td>
        </tr>
        <tr>
          <td style="font-family:${STACK};font-size:17px;line-height:1.6;color:${BLANCO};padding-bottom:${estimate ? '20px' : '32px'};">
            ${lead.split('\n').map(escape).join('<br>')}
          </td>
        </tr>
        ${
          estimate
            ? `<tr>
          <td style="font-family:${STACK};font-size:13px;letter-spacing:0.08em;color:${GRIS};padding-bottom:32px;">
            ${escape(estimate)}
          </td>
        </tr>`
            : ''
        }
        ${
          cta
            ? `<tr>
          <td>
            <a href="${escape(url)}" style="display:inline-block;font-family:${STACK};font-size:14px;font-weight:700;letter-spacing:0.12em;color:${CARBON};background:${AMBAR};padding:15px 28px;text-decoration:none;">
              ${escape(cta)}
            </a>
          </td>
        </tr>`
            : ''
        }
        ${
          note
            ? `<tr>
          <td style="font-family:${STACK};font-size:13px;line-height:1.6;color:${GRIS};">
            ${escape(note)}
          </td>
        </tr>`
            : ''
        }
        <tr>
          <td style="font-family:${STACK};font-size:12px;letter-spacing:0.14em;color:${GRIS};padding-top:44px;">
            P.21
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`

  return { subject, html, text }
}

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
