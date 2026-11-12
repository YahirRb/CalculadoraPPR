import { Html, Head, Body, Container, Text } from '@react-email/components';

interface LeadEmailProps {
  nombreCliente?: string;
  montoAhorro?: number;
}

export const LeadEmail = ({ 
  nombreCliente = "Carlos Mendoza", 
  montoAhorro = 150000 
}: LeadEmailProps) => (
  <Html>
    <Head />
    <Body style={{ backgroundColor: '#F7EEDD', fontFamily: 'sans-serif', padding: '20px' }}>
      <Container style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px' }}>
        <Text style={{ color: '#3D1425', fontSize: '20px', fontWeight: 'bold' }}>
          ¡Nuevo prospecto generado!
        </Text>
        <Text style={{ color: '#333333' }}>
          El cliente <strong>{nombreCliente}</strong> ha realizado una proyección con un ahorro sugerido de ${montoAhorro.toLocaleString('es-MX')} MXN.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default LeadEmail;