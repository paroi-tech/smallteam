import * as $ from 'jquery'
import {createApplication} from 'bkb'
import App from './App/App'

$(() => {
  createApplication(App).start()
})