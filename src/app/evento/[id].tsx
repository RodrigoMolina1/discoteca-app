
import { useLocalSearchParams, router } from 'expo-router';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';

const events: Record<string, {
  name: string;
  date: string;
  time: string;
  description: string;
  dressCode: string;
}> = {
  '1': {
    name: 'GOLDEN NIGHT',
    date: 'SÁBADO 17 DE OCTUBRE',
    time: '00:00 — 06:00',
    description:
      'Una noche especial con música electrónica, luces doradas y una experiencia premium.',
    dressCode: 'Elegante',
  },
  '2': {
    name: 'AFTER DARK',
    date: 'VIERNES 23 DE OCTUBRE',
    time: '00:00 — 06:00',
    description:
      'La mejor selección de música urbana para disfrutar una noche diferente.',
    dressCode: 'Casual elegante',
  },
  '3': {
    name: 'BLACK EDITION',
    date: 'SÁBADO 31 DE OCTUBRE',
    time: '00:00 — 06:00',
    description:
      'Una edición exclusiva con una atmósfera oscura, sofisticada y minimalista.',
    dressCode: 'Total black',
  },
};

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = events[id ?? ''];

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Evento no encontrado</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Volver</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← VOLVER</Text>
        </Pressable>

        <View style={styles.poster}>
          <Text style={styles.posterLabel}>BOLICHE PRESENTA</Text>
          <Text style={styles.posterTitle}>{event.name}</Text>
          <View style={styles.line} />
          <Text style={styles.posterSubtitle}>NIGHTLIFE EXPERIENCE</Text>
        </View>

        <Text style={styles.eyebrow}>DETALLES DEL EVENTO</Text>
        <Text style={styles.title}>{event.name}</Text>
        <Text style={styles.description}>{event.description}</Text>

        <View style={styles.infoCard}>
          <Text style={styles.label}>FECHA</Text>
          <Text style={styles.value}>{event.date}</Text>

          <Text style={styles.label}>HORARIO</Text>
          <Text style={styles.value}>{event.time}</Text>

          <Text style={styles.label}>VESTIMENTA</Text>
          <Text style={styles.value}>{event.dressCode}</Text>
        </View>

        <Pressable
          style={styles.button}
          onPress={() => alert('¡Próximamente podrás reservar tu entrada!')}
        >
          <Text style={styles.buttonText}>RESERVAR ENTRADA →</Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          Información de muestra. Los eventos y horarios son ficticios.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090909',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  backText: {
    color: '#D6B56D',
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 24,
  },
  poster: {
    height: 260,
    backgroundColor: '#17140D',
    borderWidth: 1,
    borderColor: '#806A3B',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginBottom: 32,
  },
  posterLabel: {
    color: '#D6B56D',
    fontSize: 10,
    letterSpacing: 3,
  },
  posterTitle: {
    color: '#F4E4B8',
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginVertical: 22,
  },
  line: {
    width: 60,
    height: 1,
    backgroundColor: '#D6B56D',
  },
  posterSubtitle: {
    color: '#B8B3A7',
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 18,
  },
  eyebrow: {
    color: '#D6B56D',
    fontSize: 10,
    letterSpacing: 3,
    marginBottom: 10,
  },
  title: {
    color: '#F5F0E5',
    fontSize: 27,
    fontWeight: '800',
    marginBottom: 12,
  },
  description: {
    color: '#AAA69D',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#292929',
    padding: 20,
    marginBottom: 24,
  },
  label: {
    color: '#D6B56D',
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 6,
  },
  value: {
    color: '#F5F0E5',
    fontSize: 15,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#D6B56D',
    padding: 17,
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: '#090909',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  disclaimer: {
    color: '#77736B',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 20,
  },
});