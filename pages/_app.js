import '../styles/globals.css'
import Snowflakes from '../components/Snowflakes'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Snowflakes />
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
