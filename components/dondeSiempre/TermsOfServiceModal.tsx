'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type TermsOfServiceModalProps = {
  trigger?: React.ReactNode;
};

// Colores de marca exactos del PDF
const ORANGE = '#c65a3a';
const TEAL = '#4db8b0';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-bold text-base mt-1" style={{ color: ORANGE }}>
      {children}
    </h3>
  );
}

function SubSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="font-semibold text-sm" style={{ color: TEAL }}>
      {children}
    </h4>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-foreground/80 leading-relaxed">{children}</p>;
}

export default function TermsOfServiceModal({ trigger }: TermsOfServiceModalProps) {
  const [open, setOpen] = useState(false);

  const defaultTrigger = (
    <Button variant="outline" className="w-full">
      Términos de servicio y privacidad
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col gap-0">
        <DialogHeader className="pb-3 border-b border-border">
          <DialogTitle className="text-center space-y-0.5">
            <div className="text-2xl font-extrabold tracking-wide" style={{ color: ORANGE }}>
              DONDESIEMPRE
            </div>
            <div className="text-sm font-semibold" style={{ color: TEAL }}>
              Términos de Servicio y Política de Privacidad
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 pt-4 pr-1 space-y-4 text-sm">
          <P>
            Bienvenido/a a DondeSiempre. Antes de utilizar nuestra aplicación, le rogamos que lea
            atentamente el presente documento, que regula tanto las condiciones de uso de la
            plataforma como el tratamiento de sus datos personales. Al acceder o utilizar
            DondeSiempre, usted declara haber leído, comprendido y aceptado íntegramente estos
            términos. Si no está de acuerdo con alguno de ellos, le pedimos que se abstenga de
            utilizar la aplicación.
          </P>

          <hr className="border-border" />

          <section className="space-y-2">
            <SectionTitle>1. Descripción del Servicio</SectionTitle>
            <P>
              DondeSiempre es una plataforma digital de comercio local que actúa como escaparate
              centralizado para tiendas físicas de moda, ropa y complementos, con especial
              implantación en la ciudad de Sevilla y su área metropolitana. La plataforma permite a
              los usuarios descubrir tiendas cercanas mediante un buscador geolocalizado, consultar
              su catálogo de productos y realizar compras de forma segura sin salir de la
              aplicación.
            </P>
            <P>
              DondeSiempre no es el vendedor de los productos: actúa como intermediario tecnológico
              entre comercios locales verificados y consumidores finales, facilitando la transacción
              y garantizando su seguridad mediante un sistema de retención de fondos hasta la
              entrega efectiva del producto.
            </P>
            <P>
              Adicionalmente, la plataforma ofrece funcionalidades de tipo red social para que los
              comercios puedan publicar contenido promocional y mantener al tanto a su comunidad de
              seguidores.
            </P>
          </section>

          <hr className="border-border" />

          <section className="space-y-3">
            <SectionTitle>2. Registro y Perfiles de Usuario</SectionTitle>
            <P>La plataforma distingue dos tipos de cuenta:</P>

            <div className="space-y-1">
              <SubSectionTitle>2.1. Compradores</SubSectionTitle>
              <P>
                El acceso y uso de DondeSiempre está reservado a personas mayores de 18 años. Los
                menores de edad no podrán registrarse ni realizar compras a través de la plataforma.
                Al crear una cuenta, el usuario declara expresamente tener 18 años cumplidos o la
                mayoría de edad legal en su país de residencia. DondeSiempre se reserva el derecho a
                cancelar cualquier cuenta en la que se detecte que el titular no cumple este
                requisito.
              </P>
              <P>
                Para realizar compras, seguir tiendas o interactuar con contenido es necesario crear
                una cuenta proporcionando nombre, dirección de correo electrónico y contraseña. El
                usuario es responsable de la veracidad de los datos facilitados y de la
                confidencialidad de sus credenciales de acceso.
              </P>
            </div>

            <div className="space-y-1">
              <SubSectionTitle>2.2. Comerciantes Locales</SubSectionTitle>
              <P>
                El acceso como comerciante está reservado a negocios físicos legalmente constituidos
                con licencia comercial en vigor. El proceso de alta incluye una verificación manual
                por parte del equipo de DondeSiempre, que podrá solicitar la documentación que
                considere necesaria para confirmar la legitimidad del negocio. DondeSiempre se
                reserva el derecho a denegar o suspender el acceso de cualquier comercio que no
                cumpla los requisitos establecidos o que incumpla las presentes condiciones.
              </P>
            </div>
          </section>

          <hr className="border-border" />

          <section className="space-y-3">
            <SectionTitle>3. Gestión de Pagos y Pedidos</SectionTitle>

            <div className="space-y-1">
              <SubSectionTitle>3.1. Flujo del Pedido</SubSectionTitle>
              <P>El proceso de compra en DondeSiempre funciona de la siguiente manera:</P>
              <ul className="list-none space-y-1 text-sm text-foreground/80 ml-2">
                {[
                  'El comprador selecciona los productos y realiza la solicitud de pedido.',
                  'La tienda recibe la notificación y dispone de un plazo para confirmar o rechazar el pedido.',
                  'Solo tras la confirmación por parte de la tienda se procede al cargo en el método de pago del comprador.',
                  'El importe queda retenido en la pasarela de pago de DondeSiempre hasta que se verifica la entrega del producto.',
                  'En el caso de recogida en tienda, el comprador recibe un código de pedido único que debe presentar al recoger el producto. La tienda introduce dicho código en la aplicación para confirmar la entrega y liberar el pago.',
                ].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span style={{ color: ORANGE }} className="shrink-0">
                      –
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-1">
              <SubSectionTitle>3.2. Retención y Transferencia de Fondos</SubSectionTitle>
              <P>
                DondeSiempre actúa como intermediario de pagos. Los fondos abonados por el comprador
                no se transfieren directamente a la tienda, sino que permanecen retenidos hasta que
                la entrega queda confirmada en la plataforma.
              </P>
            </div>

            <div className="space-y-1">
              <SubSectionTitle>3.3. Cancelaciones y Devoluciones</SubSectionTitle>
              <P>
                Si se cancela el pedido, ya sea por rechazo de la tienda o una vez que la tienda
                confirma el pedido y posteriormente no puede completar la entrega, procederá a la
                devolución del importe abonado, descontando los gastos de gestión de la pasarela de
                pago (Stripe), que no son recuperables una vez procesada la transacción. La
                devolución se realizará en el método de pago original del comprador en un plazo
                máximo de 5 a 10 días hábiles, dependiendo de la entidad bancaria. Las políticas de
                devolución por cambio de opinión o defecto del producto se regirán por lo indicado
                en la ficha de cada comercio y la normativa de consumo aplicable. De conformidad con
                la Directiva 2011/83/UE sobre derecho de los consumidores y su transposición en el
                Real Decreto Legislativo 1/2007 (TRLGDCU), el comprador dispone de un plazo de 14
                días naturales desde la recepción del producto para ejercer su derecho de
                desistimiento sin necesidad de justificación. Para ejercerlo, el comprador debe
                notificarlo escribiendo a{' '}
                <a
                  href="mailto:dondesiempreispp@gmail.com"
                  style={{ color: TEAL }}
                  className="underline underline-offset-2"
                >
                  dondesiempreispp@gmail.com
                </a>
                . Los gastos de devolución del producto correrán a cargo del comprador salvo que el
                comercio indique lo contrario en su ficha. Quedan excluidos del derecho de
                desistimiento los productos confeccionados a medida, los productos sellados que no
                sean aptos para ser devueltos por razones de higiene o protección de la salud y que
                hayan sido desprecintados tras la entrega, conforme al artículo 103 del TRLGDCU.
              </P>
            </div>
          </section>

          <hr className="border-border" />

          <section className="space-y-3">
            <SectionTitle>4. Política de Privacidad</SectionTitle>
            <P>
              En cumplimiento del Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 de
              Protección de Datos Personales (LOPDGDD), DondeSiempre informa a sus usuarios del
              tratamiento que realiza de sus datos personales.
            </P>

            <div className="space-y-1">
              <SubSectionTitle>4.1. Responsable del Tratamiento</SubSectionTitle>
              <P>
                El responsable del tratamiento de los datos personales recogidos a través de la
                aplicación es DondeSiempre, S.L. (en proceso de constitución), con domicilio social
                en Sevilla, España. Puede contactar con nosotros en materia de privacidad a través
                de:{' '}
                <a
                  href="mailto:dondesiempreispp@gmail.com"
                  style={{ color: TEAL }}
                  className="underline underline-offset-2"
                >
                  dondesiempreispp@gmail.com
                </a>
              </P>
            </div>

            <div className="space-y-2">
              <SubSectionTitle>4.2. Datos Recogidos y Finalidad</SubSectionTitle>
              <P>
                A continuación se detallan todos los datos personales recogidos, su base legal y la
                finalidad concreta para la que son tratados:
              </P>
              <div className="overflow-x-auto rounded border border-border">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ backgroundColor: TEAL }}>
                      <th className="text-left px-3 py-2 font-semibold text-white">
                        Dato recogido
                      </th>
                      <th className="text-left px-3 py-2 font-semibold text-white">Base legal</th>
                      <th className="text-left px-3 py-2 font-semibold text-white">
                        Finalidad del uso
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      [
                        'Nombre y apellidos',
                        'Ejecución del contrato',
                        'Identificación del usuario para la gestión de la cuenta y la tramitación de pedidos.',
                      ],
                      [
                        'Dirección de correo electrónico',
                        'Ejecución del contrato',
                        'Creación y gestión de la cuenta. Comunicaciones transaccionales (confirmaciones de pedido, notificaciones de entrega).',
                      ],
                      [
                        'Contraseña (cifrada)',
                        'Ejecución del contrato',
                        'Autenticación segura del usuario en la plataforma. Almacenada siempre en formato hasheado; DondeSiempre nunca accede a la contraseña en texto claro.',
                      ],
                      [
                        'Ubicación geográfica',
                        'Consentimiento explícito',
                        'Funcionamiento del buscador por mapa: mostrar tiendas próximas al usuario en tiempo real. Solo se activa con permiso expreso del dispositivo.',
                      ],
                      [
                        'Datos de pago (tarjeta/cuenta)',
                        'Ejecución del contrato',
                        'Procesamiento del cobro a través de la pasarela de pago. DondeSiempre no almacena datos de tarjeta en sus servidores; son gestionados por el proveedor de pagos certificado (Stripe).',
                      ],
                      [
                        'Historial de pedidos',
                        'Ejecución del contrato / Interés legítimo',
                        'Gestión de incidencias, devoluciones y servicio al cliente. Generación de estadísticas de uso anonimizadas.',
                      ],
                      [
                        'Datos de perfil de la tienda (nombre, horario, teléfono, dirección, fotos, redes sociales)',
                        'Ejecución del contrato',
                        'Personalización del escaparate digital del comercio y facilitación del contacto entre tienda y cliente.',
                      ],
                      [
                        'Contenido publicado por la tienda (imágenes de producto, historias, promociones)',
                        'Ejecución del contrato',
                        'Visualización en el catálogo y en la sección de historias de la plataforma.',
                      ],
                      [
                        'Datos de uso y navegación (logs, dispositivo, sistema operativo)',
                        'Interés legítimo',
                        'Detección de errores, mejora de la experiencia de usuario, seguridad y prevención del fraude.',
                      ],
                    ].map(([dato, base, fin], i) => (
                      <tr key={i} className={i % 2 === 0 ? '' : 'bg-muted/30'}>
                        <td className="px-3 py-2 text-foreground/80 align-top">{dato}</td>
                        <td className="px-3 py-2 text-foreground/80 align-top whitespace-nowrap">
                          {base}
                        </td>
                        <td className="px-3 py-2 text-foreground/80 align-top">{fin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-1">
              <SubSectionTitle>4.3. Conservación de los Datos</SubSectionTitle>
              <P>
                Los datos personales se conservarán durante el tiempo necesario para cumplir con la
                finalidad para la que fueron recabados y para atender posibles responsabilidades
                legales. Los datos de facturación se conservarán durante el plazo legalmente exigido
                (mínimo 5 años conforme a la normativa mercantil y fiscal española). Los datos de la
                cuenta se eliminarán dentro de los 30 días siguientes a la solicitud de baja.
              </P>
            </div>

            <div className="space-y-1">
              <SubSectionTitle>4.4. Derechos del Usuario</SubSectionTitle>
              <P>
                De acuerdo con el RGPD, usted tiene derecho a acceder, rectificar, suprimir,
                oponerse, limitar o portar sus datos personales. Para ejercer cualquiera de estos
                derechos, puede dirigirse a{' '}
                <a
                  href="mailto:dondesiempreispp@gmail.com"
                  style={{ color: TEAL }}
                  className="underline underline-offset-2"
                >
                  dondesiempreispp@gmail.com
                </a>{' '}
                adjuntando copia de su documento de identidad. Tiene también derecho a presentar una
                reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).
              </P>
            </div>

            <div className="space-y-1">
              <SubSectionTitle>4.5. Cesión de Datos a Terceros</SubSectionTitle>
              <P>
                DondeSiempre no cederá sus datos personales a terceros salvo en los siguientes
                supuestos: (i) proveedores tecnológicos necesarios para la prestación del servicio
                (pasarela de pagos, servicios de alojamiento en la nube), que actúan como encargados
                del tratamiento bajo contrato de encargo; (ii) cuando sea requerido por obligación
                legal o por orden de autoridad competente.
              </P>
            </div>
          </section>

          <hr className="border-border" />

          <section className="space-y-3">
            <SectionTitle>5. Propiedad Intelectual y Contenido</SectionTitle>

            <div className="space-y-1">
              <SubSectionTitle>5.1. Escaparate de Productos</SubSectionTitle>
              <P>
                Los comercios son los únicos responsables de la veracidad, exactitud y actualización
                de la información de sus productos, incluyendo descripciones, precios,
                disponibilidad de stock e imágenes. DondeSiempre se reserva el derecho a retirar o
                moderar cualquier contenido que no se ajuste al ámbito de moda y comercio local, que
                sea inexacto, engañoso o que vulnere derechos de terceros.
              </P>
            </div>

            <div className="space-y-1">
              <SubSectionTitle>5.2. Funcionalidad de Historias</SubSectionTitle>
              <P>
                Los comercios pueden publicar contenido en formato historia (instagram) con fines
                exclusivamente promocionales de su propio negocio. Queda expresamente prohibido
                publicar como promoción contenido que no sea directamente relativo a la actividad
                comercial propia. Los comercios pueden compartir sus promociones a través de otras
                redes sociales utilizando la función de compartir integrada en la aplicación.
              </P>
            </div>

            <div className="space-y-1">
              <SubSectionTitle>5.3. Propiedad de la Plataforma</SubSectionTitle>
              <P>
                Todos los derechos sobre la plataforma DondeSiempre, incluyendo su diseño, código
                fuente, marcas, logotipos y funcionalidades, son propiedad exclusiva de DondeSiempre
                o de sus licenciantes. Queda prohibida cualquier reproducción, distribución o uso no
                autorizado de dichos elementos.
              </P>
            </div>
          </section>

          <hr className="border-border" />

          <section className="space-y-3">
            <SectionTitle>6. Modelo de Monetización</SectionTitle>
            <P>
              El uso de la plataforma por parte de los comercios implica la aceptación del siguiente
              modelo de comisiones y suscripciones:
            </P>

            <div className="space-y-1">
              <SubSectionTitle>6.1. Comisiones por Venta</SubSectionTitle>
              <P>
                DondeSiempre aplica una comisión sobre cada venta completada a través de la
                plataforma. La comisión se descuenta automáticamente del importe a transferir a la
                tienda y varía según el plan contratado:
              </P>
              <ul className="list-none space-y-1 text-sm text-foreground/80 ml-2">
                {[
                  'Plan Gratuito: 5 % sobre el valor de cada transacción completada.',
                  'Plan Premium: 2 % sobre el valor de cada transacción completada.',
                ].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span style={{ color: ORANGE }} className="shrink-0">
                      –
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <P>
                No se aplica ninguna comisión en pedidos rechazados o cancelados, ni en devoluciones
                al cliente.
              </P>
            </div>

            <div className="space-y-1">
              <SubSectionTitle>6.2. Planes Premium</SubSectionTitle>
              <P>
                Los comercios pueden acceder a funcionalidades avanzadas mediante la contratación
                del Plan Premium. El detalle de prestaciones, precios y condiciones de contratación
                de cada plan está disponible en la sección de tarifas (Pricing) de la aplicación.
                DondeSiempre se reserva el derecho a modificar los precios y características de los
                planes con un preaviso mínimo de 30 días.
              </P>
            </div>
          </section>

          <hr className="border-border" />

          <section className="space-y-3">
            <SectionTitle>7. Obligaciones y Responsabilidades</SectionTitle>

            <div className="space-y-1">
              <SubSectionTitle>7.1. Obligaciones del Usuario</SubSectionTitle>
              <P>
                El usuario se compromete a utilizar la plataforma de conformidad con la ley y con
                las presentes condiciones, a no facilitar datos falsos o de terceros sin su
                consentimiento, y a no llevar a cabo acciones que puedan dañar, inutilizar o
                deteriorar la plataforma o los intereses de otros usuarios.
              </P>
            </div>

            <div className="space-y-1">
              <SubSectionTitle>7.2. Limitación de Responsabilidad</SubSectionTitle>
              <P>
                DondeSiempre no será responsable de los daños que puedan derivarse de interrupciones
                del servicio ajenas a su control, del incumplimiento por parte de los comercios de
                sus obligaciones frente al comprador, de la calidad o idoneidad de los productos
                vendidos por los comercios, ni del uso indebido de la plataforma por parte de
                terceros. En cualquier caso, la responsabilidad máxima de DondeSiempre se limitará
                al importe de la última transacción realizada por el usuario afectado.
              </P>
            </div>

            <div className="space-y-1">
              <SubSectionTitle>7.3. Uso Indebido y Suspensión de Cuenta</SubSectionTitle>
              <P>
                Queda expresamente prohibido el uso de DondeSiempre para fines fraudulentos o
                ilícitos. A título enunciativo y no limitativo, se consideran usos indebidos los
                siguientes:
              </P>
              <ul className="list-none space-y-1 text-sm text-foreground/80 ml-2">
                {[
                  'Crear cuentas con identidades falsas o datos de terceros sin su consentimiento.',
                  'Simular transacciones o pedidos con el fin de manipular el sistema de pagos o de valoraciones.',
                  'Publicar contenido falso, engañoso, ofensivo o que infrinja derechos de terceros.',
                  'Intentar acceder de forma no autorizada a los sistemas o datos de otros usuarios.',
                  'Utilizar la plataforma para actividades de spam, phishing o cualquier otra práctica abusiva.',
                  'Registrar comercios que no sean negocios físicos reales o que no dispongan de licencia comercial en vigor.',
                ].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span style={{ color: ORANGE }} className="shrink-0">
                      –
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <P>
                DondeSiempre se reserva el derecho a suspender o cancelar, de forma temporal o
                definitiva y sin previo aviso, cualquier cuenta en la que se detecte un uso indebido
                de la plataforma, fraude o incumplimiento de las presentes condiciones. En caso de
                cancelación por motivos imputables al usuario, no habrá lugar a compensación alguna.
                DondeSiempre podrá además emprender las acciones legales que estime oportunas para
                la defensa de sus intereses y los de la comunidad de usuarios.
              </P>
            </div>
          </section>

          <hr className="border-border" />

          <section className="space-y-3">
            <SectionTitle>8. Política de Cookies</SectionTitle>
            <P>
              DondeSiempre utilizará únicamente cookies técnicas estrictamente necesarias para el
              funcionamiento de la aplicación. No utilizamos cookies de analítica, publicidad,
              rastreo ni de ningún otro tipo que no sea imprescindible para prestar el servicio.
            </P>

            <div className="space-y-1">
              <SubSectionTitle>8.1. Qué son las cookies técnicas</SubSectionTitle>
              <P>
                Las cookies técnicas son aquéllas que permiten al usuario navegar por la aplicación
                y utilizar sus funciones básicas, como mantener la sesión iniciada. Sin estas
                cookies, la aplicación no puede funcionar correctamente.
              </P>
            </div>

            <div className="space-y-1">
              <SubSectionTitle>8.2. Cookies que utilizamos</SubSectionTitle>
              <P>Las únicas cookies presentes en DondeSiempre son las siguientes:</P>
              <ul className="list-none space-y-1 text-sm text-foreground/80 ml-2">
                {[
                  'Sesión de usuario: identifica al usuario autenticado durante el uso de la aplicación. Se elimina al cerrar sesión.',
                  'Preferencias de la aplicación: almacena ajustes básicos del usuario (como preferencias de visualización). No contiene información personal identificable.',
                  'Seguridad: tokens necesarios para proteger las peticiones contra ataques CSRF y garantizar la integridad de las comunicaciones.',
                ].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span style={{ color: ORANGE }} className="shrink-0">
                      –
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-1">
              <SubSectionTitle>8.3. Lo que no hacemos</SubSectionTitle>
              <P>
                DondeSiempre no instala ni utiliza cookies de analítica (como Google Analytics),
                cookies publicitarias, cookies de redes sociales ni ningún tipo de tecnología de
                rastreo del comportamiento del usuario con fines comerciales o estadísticos. No
                compartimos información de navegación con terceros.
              </P>
              <P>
                Al tratarse exclusivamente de cookies técnicas necesarias, no se requiere el
                consentimiento previo del usuario para su instalación, de conformidad con el
                artículo 22.2 de la Ley 34/2002 de Servicios de la Sociedad de la Información
                (LSSI).
              </P>
            </div>
          </section>

          <hr className="border-border" />

          <section className="space-y-2">
            <SectionTitle>9. Modificaciones y Ley Aplicable</SectionTitle>
            <P>
              DondeSiempre se reserva el derecho a modificar los presentes términos en cualquier
              momento. Los cambios serán notificados a los usuarios registrados con un preaviso
              mínimo de 15 días antes de su entrada en vigor. El uso continuado de la plataforma
              tras la notificación implicará la aceptación de los nuevos términos.
            </P>
            <P>
              Estos términos se rigen por la legislación española. Para la resolución de cualquier
              controversia, las partes se someten a los juzgados y tribunales de la ciudad de
              Sevilla, sin perjuicio de los fueros que correspondan a los consumidores según la
              normativa vigente.
            </P>
          </section>

          <hr className="border-border" />

          <section className="space-y-2">
            <SectionTitle>Cómo ejercer el derecho al olvido</SectionTitle>
            <P>
              De acuerdo con el artículo 17 del RGPD, tienes derecho a solicitar la supresión de tus
              datos personales. Para ejercerlo, escríbenos a:
            </P>
            <a
              href="mailto:dondesiempreispp+olvido@gmail.com"
              className="inline-flex items-center gap-2 text-sm font-medium underline underline-offset-2"
              style={{ color: TEAL }}
            >
              dondesiempreispp+olvido@gmail.com
            </a>
            <P>
              Los datos de la cuenta se eliminarán en un plazo máximo de 30 días desde la recepción
              de tu solicitud, adjuntando copia de tu documento de identidad.
            </P>
          </section>

          <hr className="border-border" />

          <section className="space-y-2">
            <SectionTitle>Cómo ejercer el derecho a la portabilidad de datos</SectionTitle>
            <P>
              De acuerdo con el artículo 20 del RGPD, tienes derecho a recibir tus datos en un
              formato estructurado y de lectura mecánica. Para ejercerlo, escríbenos a:
            </P>
            <a
              href="mailto:dondesiempreispp+datos@gmail.com"
              className="inline-flex items-center gap-2 text-sm font-medium underline underline-offset-2"
              style={{ color: TEAL }}
            >
              dondesiempreispp+datos@gmail.com
            </a>
            <P>
              Te facilitaremos los datos en un plazo máximo de 30 días desde la recepción de tu
              solicitud, adjuntando copia de tu documento de identidad.
            </P>
          </section>

          <hr className="border-border" />

          <section className="space-y-2">
            <SectionTitle>Comunicación en caso de brecha de seguridad</SectionTitle>
            <P>
              En caso de detectar una brecha de seguridad que afecte a tus datos personales,
              DondeSiempre seguirá el siguiente protocolo:
            </P>
            <ul className="list-none space-y-1 text-sm text-foreground/80 ml-2">
              {[
                'Detección y análisis: identificaremos el alcance de la brecha en el menor tiempo posible.',
                'Notificación a la AEPD: si supone un riesgo para tus derechos, notificaremos a la Agencia Española de Protección de Datos en un plazo máximo de 72 horas (art. 33 RGPD).',
                'Comunicación a los afectados: si supone un alto riesgo, te informaremos directamente por correo electrónico sin dilación indebida (art. 34 RGPD).',
                'Medidas correctoras: aplicaremos las medidas técnicas y organizativas necesarias para resolver la brecha.',
                'Registro interno: documentaremos el incidente conforme al artículo 33.5 del RGPD.',
              ].map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span style={{ color: ORANGE }} className="shrink-0">
                    –
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <P>
              Para cualquier consulta de seguridad, contáctanos en{' '}
              <a
                href="mailto:dondesiempreispp@gmail.com"
                style={{ color: TEAL }}
                className="underline underline-offset-2"
              >
                dondesiempreispp@gmail.com
              </a>
              . Puedes también reclamar ante la{' '}
              <strong>Agencia Española de Protección de Datos</strong> (www.aepd.es).
            </P>
          </section>

          <p className="text-xs text-center pb-1" style={{ color: '#999' }}>
            Última actualización: 13 de abril de 2026 · © 2026 DondeSiempre. Todos los derechos
            reservados.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
