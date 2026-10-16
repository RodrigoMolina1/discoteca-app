
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';

const events = [
  {
    id: '1',
    name: 'GOLDEN NIGHT',
    day: 'SÁBADO',
    time: '23:00 HS',
    category: 'NOCHE PREMIUM',
  },
  {
    id: '2',
    name: 'AFTER DARK',
    day: 'VIERNES',
    time: '00:00 HS',
    category: 'CLUB NIGHT',
  },
  {
    id: '3',
    name: 'BLACK EDITION',
    day: 'DOMINGO',
    time: '22:00 HS',
    category: 'EDICIÓN ESPECIAL',
  },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>BOLICHE</Text>
            <Text style={styles.logoSubtitle}>
              NIGHTLIFE EXPERIENCE
            </Text>
          </View>

          <View style={styles.menuIcon}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </View>
        </View>

        {/* Presentación */}
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>
            DESCUBRÍ LA NOCHE
          </Text>

          <Text style={styles.title}>
            Noches que{'\n'}dejan huella.
          </Text>

          <Text style={styles.description}>
            Viví experiencias únicas.
            Descubrí lo que tenemos preparado para vos.
          </Text>
        </View>

        {/* Evento destacado */}
        <Pressable
          style={({ pressed }) => [
            styles.featuredCard,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push('/evento/1')}
          
        >
          <View style={styles.featuredArtwork}>
            <Text style={styles.artworkTop}>
              BOLICHE PRESENTA
            </Text>

            <Text style={styles.artworkTitle}>
              GOLDEN
            </Text>

            <Text style={styles.artworkTitle}>
              NIGHT
            </Text>

            <View style={styles.artworkDivider} />

            <Text style={styles.artworkBottom}>
              UNA NOCHE EXCLUSIVA
            </Text>
          </View>

          <View style={styles.featuredInfo}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                EVENTO DESTACADO
              </Text>
            </View>

            <Text style={styles.eventDate}>
              SÁBADO · 23:00 HS
            </Text>

            <Text style={styles.eventName}>
              Golden Night
            </Text>

            <Text style={styles.eventDescription}>
              Música, luces y una experiencia diferente.
            </Text>

            <View style={styles.button}>
              <Text style={styles.buttonText}>
                DESCUBRIR EVENTO  →
              </Text>
            </View>
          </View>
        </Pressable>

        {/* Próximos eventos */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.eyebrow}>
              LA AGENDA
            </Text>

            <Text style={styles.sectionTitle}>
              Próximos eventos
            </Text>
          </View>

          <Text style={styles.eventCount}>
            0{events.length}
          </Text>
        </View>

        {events.map((event, index) => (
          <Pressable
            key={event.id}
            style={({ pressed }) => [
              styles.eventCard,
              pressed && styles.pressed,
            ]}
            onPress={() => router.push(`/evento/${event.id}`)}
            
          >
            <View style={styles.eventNumber}>
              <Text style={styles.eventNumberText}>
                0{index + 1}
              </Text>
            </View>

            <View style={styles.eventDetails}>
              <Text style={styles.eventCategory}>
                {event.category}
              </Text>

              <Text style={styles.eventListName}>
                {event.name}
              </Text>

              <Text style={styles.eventDate}>
                {event.day} · {event.time}
              </Text>
            </View>

            <Text style={styles.arrow}>↗</Text>
          </Pressable>
        ))}

        {/* Pie */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}>BOLICHE</Text>
          <Text style={styles.footerText}>
            TU PRÓXIMA NOCHE EMPIEZA ACÁ.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const GOLD = '#D6B56D';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 26,
    borderBottomWidth: 1,
    borderBottomColor: '#29251C',
  },
  logo: {
    color: GOLD,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: 5,
  },
  logoSubtitle: {
    color: '#A59A83',
    fontSize: 8,
    letterSpacing: 2,
    marginTop: 5,
  },
  menuIcon: {
    gap: 5,
    padding: 8,
  },
  menuLine: {
    width: 23,
    height: 2,
    backgroundColor: GOLD,
  },
  intro: {
    paddingTop: 34,
    paddingBottom: 26,
  },
  eyebrow: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.5,
  },
  title: {
    color: '#F8F5EF',
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 43,
    marginTop: 13,
  },
  description: {
    color: '#A9A49A',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
    maxWidth: 290,
  },
  featuredCard: {
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#171612',
    borderWidth: 1,
    borderColor: '#393020',
  },
  featuredArtwork: {
    minHeight: 205,
    backgroundColor: '#211D14',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  artworkTop: {
    color: GOLD,
    fontSize: 9,
    letterSpacing: 3,
    marginBottom: 17,
  },
  artworkTitle: {
    color: '#F3E6C4',
    fontSize: 39,
    fontWeight: '900',
    letterSpacing: 5,
    lineHeight: 43,
  },
  artworkDivider: {
    width: 55,
    height: 1,
    backgroundColor: GOLD,
    marginVertical: 13,
  },
  artworkBottom: {
    color: '#BDA875',
    fontSize: 8,
    letterSpacing: 3,
  },
  featuredInfo: {
    padding: 19,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#6E5A32',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  badgeText: {
    color: GOLD,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  eventDate: {
    color: '#B8AD98',
    fontSize: 11,
    letterSpacing: 1,
    marginTop: 13,
  },
  eventName: {
    color: '#F8F5EF',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 7,
  },
  eventDescription: {
    color: '#A9A49A',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
  },
  button: {
    backgroundColor: GOLD,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#15130F',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 38,
    marginBottom: 17,
  },
  sectionTitle: {
    color: '#F8F5EF',
    fontSize: 23,
    fontWeight: '800',
    marginTop: 8,
  },
  eventCount: {
    color: '#766443',
    fontSize: 17,
    fontWeight: '700',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131311',
    borderWidth: 1,
    borderColor: '#292720',
    padding: 15,
    marginBottom: 10,
  },
  eventNumber: {
    width: 42,
    height: 48,
    borderWidth: 1,
    borderColor: '#55472B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventNumberText: {
    color: GOLD,
    fontSize: 15,
    fontWeight: '700',
  },
  eventDetails: {
    flex: 1,
    marginLeft: 13,
  },
  eventCategory: {
    color: GOLD,
    fontSize: 8,
    letterSpacing: 1.5,
  },
  eventListName: {
    color: '#F4F0E8',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 5,
  },
  arrow: {
    color: GOLD,
    fontSize: 23,
    marginLeft: 8,
  },
  pressed: {
    opacity: 0.7,
  },
  footer: {
    alignItems: 'center',
    marginTop: 38,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#29251C',
  },
  footerLogo: {
    color: GOLD,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 5,
  },
  footerText: {
    color: '#777064',
    fontSize: 8,
    letterSpacing: 2,
    marginTop: 9,
  },
});