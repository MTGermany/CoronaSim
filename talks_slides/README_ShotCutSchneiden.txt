https://www.youtube.com/watch?v=P9pzmzXj03A


Oeffnen: Symbol mit dunkeltuerkis mit senkr Balken oder "shotcut"
suchen

1. Projekt erstellen oder oeffnen ("new project" oder "recent
project"), z.B.

1a: neues Projekt: Zielordner festlegen, z.B.
~/vorlesungen/Verkehrsoekonometrie_Ma/skript/VideoLecturesLecture11_shotcut
Video mode auf "automatic" lassen: Dann bestimmt das *erste* Video die
Pixelzahl und fps

Alles speichern => .mlt Projekt file

2. Verwendete Videos mit "open a file" und "+" im linken Fenster
in Playlist ablegen (ggf "Playlist" darunter druecken

3. Timeline: Dort wird das Video erstellt!
 - Standard: ein Videotrack (=Audio+Video)
 - neuen Track: Rechtsklick auf Standard Track "V1" -> track
   operations -> add audio or video track (Wenn Videoschnipsel zu
   Audiotrack gezogen werden, wird nur Audio genutzt, bei Video beides)
 - remove track: Rechtsklick auf zu loeschenden Track - -> track
   operations -> remove track
- alle tracks werden parallel abgespielt, oft nur einziger Track noetig
- Lupe vergroessert/verkleinert Ausschnitt der Timeline
- Multiple "tracks" sind eigentlich nur fuer Soundbearbeitung
  noetig oder wenn man mehr als 2 Videos "faden" will, das wird aber
  dann kompliziert
  
4. Arbeiten mit der Timeline:
Beispiel: playlist hat V1,V2,V3, will Video mit V1-erster Teil
V2-V3-zweiter Teil V2

- Videoschnipsel von playlist nichtueberlappend in einen Kanal der
  Timeline ziehen, hier V2 zweimal hintereinander

- Das hintere Ende vom ersten V2 und das vordere Ende vom zweiten V2
  durch Mausziehen schneiden

- die 4 Videoelemente buendig hintereinanderstellen (falls Ueberlapp,
  wird kontinuierlich uebergeblendet, aber auch im Sound

5. Test: Im zentralen rechten oberen Fenster ird geschnittenes Video
  angezeigt, wenn man auf "Project" klickt (gibt auch Option "source")
  Man kann die abgespielte Zeit unten am weissen Strich oder auch oben
  beim Testvideo verschieben





10. Exportieren mit "file" - "Export Video" oder (li unten) "Export"

Braucht lange! grosse Files

  links "Youtube" settings, dann aber advanced => Menu. Format ->
  Matroska Frames/s 30 - Codec Reiter - Rate control - average bitrate
  - 1M
  GOP (group of pictures, max keyframe) 30  [=1 s]
  - [li unten] "Export File" [dort, wo vorher "Export" stand]
  - filename <projName>.mkv  (mit Extension, sonst DOS)
  ! Achtung, Gefahr! Nimmt automatisch mlt und ueberschreibt das
    Projektfile, ausserdem in Unterdir. Aufpassen!
  - save
