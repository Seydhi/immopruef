import { loadFont as loadPlayfair } from '@remotion/google-fonts/PlayfairDisplay'
import { loadFont as loadDMSans } from '@remotion/google-fonts/DMSans'

export const display = loadPlayfair('normal', { weights: ['500', '600', '700'], subsets: ['latin'] }).fontFamily
export const body = loadDMSans('normal', { weights: ['400', '500', '700'], subsets: ['latin'] }).fontFamily

export const C = {
  green: '#2d4a3e',
  greenMid: '#3d6455',
  greenLight: '#e8f0ec',
  gold: '#b8975a',
  goldLight: '#d4b87a',
  cream: '#f5f2eb',
  creamDark: '#ede9df',
  ink: '#1a1a18',
  inkMid: '#4a4a45',
  inkLight: '#8a8a82',
  red: '#b4532a',
}

export const W = 1080
export const H = 1920
export const FPS = 30

// Bildschirm-Karte (zeigt die Website), in Video-Pixeln
export const SCREEN = { x: 90, y: 600, w: 900, h: 1000, css: 430 }
