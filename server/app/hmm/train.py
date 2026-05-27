from collections import defaultdict, Counter
import math

START = "<START>"
END = "<END>"

class HMM:

    def __init__(self):
        self.emission = defaultdict(Counter)
        self.transition = defaultdict(Counter)
        self.tag_counts = Counter()
        self.vocab = set()

        self.emission_prob = {}
        self.transition_prob = {}

    def train(self, sentences):

        for sent in sentences:
            prev_tag = START

            for word, tag in sent:
                self.vocab.add(word)

                self.emission[tag][word] += 1
                self.transition[prev_tag][tag] += 1
                self.tag_counts[tag] += 1

                prev_tag = tag

            self.transition[prev_tag][END] += 1

        self._normalize()

    def _normalize(self):

        # emission
        for tag in self.emission:
            total = sum(self.emission[tag].values())
            self.emission_prob[tag] = {
                w: c / total for w, c in self.emission[tag].items()
            }

        # transition
        for tag in self.transition:
            total = sum(self.transition[tag].values())
            self.transition_prob[tag] = {
                t: c / total for t, c in self.transition[tag].items()
            }

    def get_emission(self):
        return self.emission_prob

    def get_transition(self):
        return self.transition_prob