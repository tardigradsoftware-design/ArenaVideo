#!/usr/bin/env python3
"""tts_split.py birim testleri:  python3 -m unittest discover -s tests -v"""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))
from tts_split import split_text  # noqa: E402

TRAPS = (
    "Dr. Ayşe Yılmaz 2024 yılında 3.5 milyon izlenme aldı. "
    "Örn. bir kanal 1.000 videoya ulaştı; tarih 24.11.2026 idi. "
    "Prof. Dr. M. Kaya, \"Bu editoryal bir sorun\" dedi. "
    "Rapor T.C. Kültür Bakanlığı'na sunuldu. Son cümle burada."
)


class SplitterTest(unittest.TestCase):
    def test_limits_respected(self):
        text = "Cümle. " * 900  # ~6300 karakter
        chunks = split_text(text, max_chars=1400)
        self.assertGreater(len(chunks), 3)
        for c in chunks:
            self.assertLessEqual(c.chars, 1400, f"parça {c.index} çok uzun")

    def test_no_data_loss(self):
        text = "Bir cümle. İki cümle! Üç cümle? Dört cümle."
        chunks = split_text(text, max_chars=100)
        joined = " ".join(c.text for c in chunks)
        self.assertEqual(" ".join(joined.split()), " ".join(text.split()))

    def test_abbreviation_and_numbers_not_split(self):
        """Kısaltma/sayı sonundaki nokta bölme noktası OLMAMALI."""
        chunks = split_text(TRAPS, max_chars=60)
        flat = " ".join(c.text for c in chunks)
        for keep in ("Dr. Ayşe", "3.5 milyon", "Örn. bir", "1.000 videoya",
                     "24.11.2026", "Prof. Dr. M. Kaya", "T.C. Kültür"):
            self.assertIn(keep, flat, f"bölünmemesi gereken yer bozuldu: {keep}")
        # hiçbir parça yarım cümleyle bitmemeli
        for c in chunks[:-1]:
            self.assertRegex(c.text.strip()[-1], r"[.!?…:;]",
                             f"parça {c.index} cümle ortasında bitiyor: …{c.text[-40:]}")

    def test_paragraph_preferred(self):
        text = "Birinci paragraf burada.\n\n" + "X" * 500 + " son.\n\nÜçüncü paragraf."
        chunks = split_text(text, max_chars=2000)  # tek parça yeter → bölünmemeli
        self.assertEqual(len(chunks), 1)

    def test_single_sentence_over_limit_is_clause_split(self):
        long = "kelime, " * 400  # tek cümle, çok uzun
        chunks = split_text(long, max_chars=300)
        for c in chunks:
            self.assertLessEqual(c.chars, 300)

    def test_tiny_tail_merged(self):
        text = "A" * 1300 + ". Kısa."
        chunks = split_text(text, max_chars=1400, min_chars=200)
        self.assertGreaterEqual(chunks[-1].chars, 200)


if __name__ == "__main__":
    unittest.main(verbosity=2)
