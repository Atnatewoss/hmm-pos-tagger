from collections import defaultdict, Counter
import math
import pickle

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
        self.tag_marginal = {}
        self.tag_list = []
        self.total_tags = 0

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
        V = len(self.vocab)
        self.total_tags = sum(self.tag_counts.values())
        self.tag_list = list(self.tag_counts.keys())
        N = len(self.tag_list)

        self.tag_marginal = {
            tag: count / self.total_tags
            for tag, count in self.tag_counts.items()
        }

        all_transition_to = self.tag_list + [END]

        for tag in self.emission:
            total = sum(self.emission[tag].values())
            denom = total + V
            probs = {w: (c + 1) / denom for w, c in self.emission[tag].items()}
            probs["<UNK>"] = 1.0 / denom
            self.emission_prob[tag] = probs

        for from_tag in self.transition:
            total = sum(self.transition[from_tag].values())
            denom = total + len(all_transition_to)
            probs = {}
            for to_tag in all_transition_to:
                c = self.transition[from_tag].get(to_tag, 0)
                probs[to_tag] = (c + 1.0) / denom
            self.transition_prob[from_tag] = probs

    def emission_of(self, tag, word):
        probs = self.emission_prob.get(tag)
        if probs is None:
            return 1e-6
        if word in self.vocab:
            return probs.get(word, probs.get("<UNK>", 1e-6))
        return self.tag_marginal.get(tag, 1e-6)

    def transition_of(self, prev_tag, tag):
        probs = self.transition_prob.get(prev_tag)
        if probs is None:
            return 1e-6
        return probs.get(tag, 1e-6)

    def save(self, path):
        with open(path, "wb") as f:
            pickle.dump(self, f)

    @classmethod
    def load(cls, path):
        with open(path, "rb") as f:
            return pickle.load(f)


def viterbi(sentence, hmm):
    words = sentence.split()
    tags = hmm.tag_list

    dp = [{}]
    backpointer = [{}]

    for tag in tags:
        trans = hmm.transition_of(START, tag)
        emit = hmm.emission_of(tag, words[0])
        dp[0][tag] = math.log(trans) + math.log(emit)
        backpointer[0][tag] = None

    for i in range(1, len(words)):
        dp.append({})
        backpointer.append({})

        for tag in tags:
            best_score = float("-inf")
            best_prev = None
            emit = hmm.emission_of(tag, words[i])

            for prev_tag in tags:
                trans = hmm.transition_of(prev_tag, tag)
                score = dp[i - 1][prev_tag] + math.log(trans) + math.log(emit)

                if score > best_score:
                    best_score = score
                    best_prev = prev_tag

            dp[i][tag] = best_score
            backpointer[i][tag] = best_prev

    last_tag = max(dp[-1], key=dp[-1].get)
    result = [last_tag]

    for i in range(len(words) - 1, 0, -1):
        last_tag = backpointer[i][last_tag]
        result.append(last_tag)

    return list(reversed(result))


class POSModel:

    def __init__(self):
        self.hmm = HMM()

    def train(self, sentences):
        self.hmm.train(sentences)

    def predict(self, sentence):
        return viterbi(sentence, self.hmm)

    def save(self, path):
        self.hmm.save(path)

    @classmethod
    def load(cls, path):
        model = cls()
        model.hmm = HMM.load(path)
        return model

    def evaluate(self, sentences):
        correct = 0
        total = 0
        for sent in sentences:
            words = [w for w, _ in sent]
            gold_tags = [t for _, t in sent]
            pred_tags = viterbi(" ".join(words), self.hmm)
            for g, p in zip(gold_tags, pred_tags):
                if g == p:
                    correct += 1
                total += 1
        return correct / total if total > 0 else 0.0
