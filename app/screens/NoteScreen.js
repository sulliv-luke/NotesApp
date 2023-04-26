import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useEffect, useState } from 'react'
import {
  FlatList,
  Keyboard,
  StatusBar,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native'

import Note from '../components/Note'
import NoteInputModal from '../components/NoteInputModal'
import RoundIconBtn from '../components/RoundIconBtn'
import NotFound from '../components/NotFound';
import SearchBar from '../components/SearchBar'
import { useNotes } from '../context/NoteProvider'
import colors from '../misc/colors';


const NoteScreen = ({ user, navigation }) => {
  const [greet, setGreet] = useState('Evening');
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [resultNotFound, setResultNotFound] = useState(false);

  const { notes, setNotes, findNotes } = useNotes();

  const findGreet = () => {
    const hours = new Date().getHours()
    if (hours === 0 || hours < 12) return setGreet('Morning')
    if (hours === 1 || hours < 17) return setGreet('Afternoon')
    setGreet('Evening')
  }

  useEffect(() => {
    findGreet()
  }, [])

  const handleOnSubmit = async (title, desc) => {
    const note = { id: Date.now(), title, desc, time: Date.now() }
    const updatedNotes = [...notes, note]
    setNotes(updatedNotes)
    await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes))
  }

  const openNote = (note) => {
    navigation.navigate('NoteDetail', { note })
  }

  const handleOnSearchInput = async text => {
    setSearchQuery(text);
    if (!text.trim()) {
      setSearchQuery('');
      setResultNotFound(false);
      return await findNotes();
    }
    const filteredNotes = notes.filter(note => {
      if (note.title.toLowerCase().includes(text.toLowerCase())) {
        return note;
      }
    });

    if (filteredNotes.length) {
      setNotes([...filteredNotes]);
    } else {
      setResultNotFound(true);
    }
  };

  const handleOnClear = async () => {
    setSearchQuery('');
    setResultNotFound(false);
    await findNotes();
  };

  return (
    <>
      <StatusBar barStyle='dark-content' backgroundColor={colors.LIGHT} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.header}>{`Good ${greet} ${user.name}`}</Text>
          {notes.length ? (
            <SearchBar
              value={searchQuery}
              onChangeText={handleOnSearchInput}
              containerStyle={{ marginVertical: 15 }}
              onClear={handleOnClear}
            />
          ) : null}

          {resultNotFound ? (
            <NotFound />
          ) : (
            <FlatList
              data={notes}
              numColumns={2}
              columnWrapperStyle={{
                justifyContent: 'space-between',
                marginBottom: 15,
              }}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <Note onPress={() => openNote(item)} item={item} />
              )}
            />
          )}

          {!notes.length ? (
            <View
              style={[
                StyleSheet.absoluteFillObject,
                styles.emptyHeaderContainer,
              ]}
            >
              <Text style={styles.emptyHeader}>Add Notes</Text>
            </View>
          ) : null}
        </View>
      </TouchableWithoutFeedback>
      <RoundIconBtn
        onPress={() => setModalVisible(true)}
        name='plus'
        style={styles.addBtn}
      />
      <NoteInputModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleOnSubmit}
      />
    </>
  )
}
const styles = StyleSheet.create({
  header: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  container: {
    paddingHorizontal: 20,
    flex: 1,
    zIndex: 1,
    marginTop: 20
  },
  emptyHeader: {
    fontSize: 30,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    opacity: 0.2,
  },
  emptyHeaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  addBtn: {
    position: 'absolute',
    right: 15,
    bottom: 50,
    zIndex: 1,
  },
});

export default NoteScreen
