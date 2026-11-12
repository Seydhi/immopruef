// Rendert alle Kompositionen (oder die per Argument genannten) nach out/<Name>.mp4
import { execFileSync } from 'node:child_process'
const ids = process.argv.slice(2).length ? process.argv.slice(2) : ['ExposeCheck', 'AnalyseDemo', 'NebenkostenLaender']
for (const id of ids) {
  console.log('Rendere', id)
  execFileSync('npx', ['remotion', 'render', 'src/index.ts', id, `out/${id}.mp4`, '--codec=h264', '--crf=18', '--log=error'], { stdio: 'inherit', shell: true })
}
