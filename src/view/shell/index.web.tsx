import React, {useEffect} from 'react'
import {StyleSheet, TouchableWithoutFeedback, View} from 'react-native'
import {msg} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {useNavigation} from '@react-navigation/native'

import {useColorSchemeStyle} from '#/lib/hooks/useColorSchemeStyle'
import {useIntentHandler} from '#/lib/hooks/useIntentHandler'
import {useWebBodyScrollLock} from '#/lib/hooks/useWebBodyScrollLock'
import {useWebMediaQueries} from '#/lib/hooks/useWebMediaQueries'
import {NavigationProp} from '#/lib/routes/types'
import {colors} from '#/lib/styles'
import {useIsDrawerOpen, useSetDrawerOpen} from '#/state/shell'
import {useComposerKeyboardShortcut} from '#/state/shell/composer/useComposerKeyboardShortcut'
import {useCloseAllActiveElements} from '#/state/util'
import {Lightbox} from '#/view/com/lightbox/Lightbox'
import {ModalsContainer} from '#/view/com/modals/Modal'
import {ErrorBoundary} from '#/view/com/util/ErrorBoundary'
import {atoms as a} from '#/alf'
import {MutedWordsDialog} from '#/components/dialogs/MutedWords'
import {SigninDialog} from '#/components/dialogs/Signin'
import {Outlet as PortalOutlet} from '#/components/Portal'
import {FlatNavigator, RoutesContainer} from '#/Navigation'
import {Composer} from './Composer.web'
import {DrawerContent} from './Drawer'

function ShellInner() {
  const isDrawerOpen = useIsDrawerOpen()
  const setDrawerOpen = useSetDrawerOpen()
  const {isDesktop} = useWebMediaQueries()
  const navigator = useNavigation<NavigationProp>()
  const closeAllActiveElements = useCloseAllActiveElements()
  const {_} = useLingui()

  useWebBodyScrollLock(isDrawerOpen)
  useComposerKeyboardShortcut()
  useIntentHandler()

  useEffect(() => {
    const unsubscribe = navigator.addListener('state', () => {
      closeAllActiveElements()
    })
    return unsubscribe
  }, [navigator, closeAllActiveElements])

  return (
    <>
      <ErrorBoundary>
        <FlatNavigator />
      </ErrorBoundary>
      <Composer winHeight={0} />
      <ModalsContainer />
      <MutedWordsDialog />
      <SigninDialog />
      <Lightbox />
      <PortalOutlet />

      {!isDesktop && isDrawerOpen && (
        <TouchableWithoutFeedback
          onPress={ev => {
            // Only close if press happens outside of the drawer
            if (ev.target === ev.currentTarget) {
              setDrawerOpen(false)
            }
          }}
          accessibilityLabel={_(msg`Close navigation footer`)}
          accessibilityHint={_(msg`Closes bottom navigation bar`)}>
          <View style={styles.drawerMask}>
            <View style={styles.drawerContainer}>
              <DrawerContent />
            </View>
          </View>
        </TouchableWithoutFeedback>
      )}
    </>
  )
}

export const Shell: React.FC = function ShellImpl() {
  const pageBg = useColorSchemeStyle(styles.bgLight, styles.bgDark)
  return (
    <View style={[a.util_screen_outer, pageBg]}>
      <RoutesContainer>
        <ShellInner />
      </RoutesContainer>
    </View>
  )
}

const styles = StyleSheet.create({
  bgLight: {
    backgroundColor: colors.white,
  },
  bgDark: {
    backgroundColor: colors.black, // TODO
  },
  drawerMask: {
    // @ts-ignore web only
    position: 'fixed',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  drawerContainer: {
    display: 'flex',
    // @ts-ignore web only
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100%',
  },
})
