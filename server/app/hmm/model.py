from .train import HMM
from .viterbi import viterbi

class POSModel:

    def __init__(self):
        self.hmm = HMM()

    def train(self, sentences):
        self.hmm.train(sentences)

    def predict(self, sentence):
        return viterbi(sentence, self.hmm)