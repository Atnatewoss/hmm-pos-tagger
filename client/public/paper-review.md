# Paper Review: Hidden Markov Neural Networks

**Authors:** Lorenzo Rimella, Nick Whiteley  
**Published in:** Entropy, 2025, 27(2), 168 — Special Issue on Advances in Probabilistic Machine Learning  
**DOI:** 10.3390/e27020168  
**arXiv:** 2004.06963

---

## 1. Summary

This paper proposes **Hidden Markov Neural Networks (HMNNs)** — a hybrid model that fuses Factorial Hidden Markov Models (FHMMs) with Bayesian neural networks to address a central tension in continual learning and time-series forecasting: how to adapt to new data while selectively forgetting outdated information.

The core idea is conceptually elegant: treat the **weights of a neural network as the hidden states of an HMM**. At each time step, the weights evolve according to a Markov transition kernel, and the observed data are generated conditioned on the current weight configuration. This formulation naturally supports online Bayesian inference — as new data arrive, the posterior over weights is updated via a filtering algorithm.

The authors derive inference using **sequential Bayes by Backprop** (a streaming variant of Blundell et al.'s Bayes by Backprop), enhanced with **variational DropConnect** for stronger regularization. The reparameterization trick enables low-variance gradient estimates. The paper evaluates HMNNs on three tasks:

1. **MNIST** — static classification with streaming data, demonstrating competitive accuracy and well-calibrated uncertainty.
2. **Dynamic two-moons** — a time-evolving classification boundary where HMNNs adapt to distribution shift while quantifying uncertainty via credible intervals.
3. **Next-frame video prediction** — forecasting on dynamic visual sequences.

---

## 2. Strengths

| Aspect | Assessment |
|---|---|
| **Problem formulation** | The HMNN elegantly frames continual learning as state-space inference — a principled Bayesian treatment of the stability-plasticity dilemma. |
| **Technical soundness** | The combination of FHMMs, variational Bayes, and DropConnect is theoretically grounded. The use of the reparameterization trick follows established practice. |
| **Uncertainty quantification** | Unlike standard NNs, HMNNs produce predictive distributions with meaningful credible intervals, a crucial property for safety-critical applications. |
| **Generality** | The framework is model-agnostic with respect to the neural architecture (experiments use fully connected networks). |
| **Reproducibility** | Code and details are provided; the arXiv preprint has had multiple revisions addressing reviewer feedback. |

---

## 3. Weaknesses

1. **Scalability ceiling.** The filtering-based variational inference requires storing and updating posterior parameters for every weight. On a network with millions of parameters (common in modern deep learning), the memory and compute cost becomes prohibitive. The experiments are limited to small architectures (no convolutional or transformer-based experiments).

2. **First-order Markov assumption.** The weight dynamics assume a first-order Markov chain: the weights at time *t* depend only on time *t−1*. This may be insufficient for data with long-range dependencies or periodic structure. Higher-order or self-attention-based transitions are not explored.

3. **Limited empirical scope.** The evaluation uses three relatively small-scale benchmarks. No experiments on:
   - Large-scale continual learning benchmarks (e.g., Split CIFAR-100, Tiny ImageNet)
   - Real-world NLP or speech tasks where HMMs have historically excelled
   - Long-horizon time-series forecasting (e.g., weather, finance)

4. **No comparison to modern alternatives.** The baselines are primarily standard neural networks and basic Bayesian NN variants. There is no comparison with:
   - Elastic Weight Consolidation (EWC)
   - Progressive Neural Networks
   - Memory Replay methods
   - Modern state-space models (e.g., Mamba, S4)

5. **Computational overhead.** The variational posterior over weights roughly doubles the parameter count, and the sequential filtering step adds per-timestep cost that scales with the network size.

---

## 4. Future Research Directions

The following directions are drawn from gaps in the current paper and from related literature in continual learning, Bayesian deep learning, and sequence modeling.

### 4.1 Scaling with Subspace Methods

The primary bottleneck of HMNNs is the full-weight posterior. A natural extension is to constrain the HMM dynamics to a **low-dimensional subspace** of the weight space, e.g., using intrinsic dimension methods (Li et al., 2018) or random projections. This would reduce the FHMM factor count dramatically, enabling HMNNs to scale to deep convolutional and transformer architectures.

### 4.2 Self-Attention Weight Transitions

The first-order Markov transition kernel limits temporal expressiveness. Replacing it with a **Transformer-based or state-space-model transition** would allow the model to capture long-range dependencies in the weight dynamics. This connects to recent work on linearizing attention (Katharopoulos et al., 2020) and structured state-space models (Gu & Dao, 2023). A self-attention weight transition could, for instance, allow the model to "remember" a relevant configuration from many timesteps ago when a similar data pattern re-emerges.

### 4.3 Application to Sequence Labeling (POS Tagging, NER)

HMNNs have a natural application to **sequence labeling** tasks like POS tagging, named entity recognition, and chunking. In these tasks, the "weights" of a neural tagger evolve as the model processes each sentence, and the HMM structure provides a principled prior over tag transitions. This would directly extend the classical HMM tagger (as implemented in our project) into a discriminative neural framework, potentially combining the strengths of both: the structured prior of HMMs and the expressive power of neural networks.

### 4.4 Federated Continual Learning

The streaming nature of HMNNs makes them well-suited for **federated learning** scenarios where each client observes a non-stationary data stream (Yoon et al., 2021). The Markov transition kernel can be interpreted as a local model update, and the server could aggregate posterior parameters rather than raw gradients — providing a natural privacy-preserving mechanism. The challenge lies in aligning the HMM states across heterogeneous clients.

### 4.5 Amortized Variational Inference

The current filtering algorithm requires per-timestep optimization. An **amortized inference network** (a la Kingma & Welling, 2014) could learn to predict the posterior weight distribution parameters directly from the observed data, significantly reducing inference cost at test time. This would make HMNNs practical for real-time applications.

### 4.6 Theoretical Guarantees for Continual Learning

The paper lacks theoretical analysis of the HMNN's convergence or regret bounds. Future work could characterize:
- **Forgetting bounds**: How much information is discarded per timestep as a function of the transition kernel's contraction rate?
- **Adaptation speed**: How many timesteps are needed to recover from a distribution shift?
- **PAC-Bayesian generalization bounds** for the online learning setting.

### 4.7 Structured Sparsity Through the Transition Kernel

The transition kernel currently applies uniformly to all weights. By learning **weight-specific transition dynamics** (e.g., different learning rates, forgetting rates, or even freezing certain weights), the model could implement a form of structured sparsity or modular continual learning. This aligns with work on sparse Gaussian processes and mixture-of-experts transitions.

### 4.8 Uncertainty-Guided Data Acquisition

The calibrated uncertainty estimates from HMNNs could drive **active learning** or **bayesian optimization** strategies in non-stationary environments. For instance, when the predictive uncertainty spikes, the system could request a human label or query a more expensive sensor — a capability directly enabled by the HMNN's probabilistic outputs.

---

## 5. Connection to Foundational References

The paper builds on three pillars that the training materials reference:

1. **Jurafsky & Martin, *Speech and Language Processing* (SLP3, Appendix A)** — Provides the foundational HMM formalism (Markov chains, transition/emission probabilities, the Viterbi algorithm) that underlies the HMNN's weight dynamics. The HMNN extends the classic discrete-state HMM to continuous weight spaces via variational inference.

2. **Bishop, *Pattern Recognition and Machine Learning* (2006)** — Covers the graphical model perspective of HMMs (Chapter 13) and variational inference (Chapter 10). The HMNN's sequential Bayes by Backprop is a direct descendant of the variational methods Bishop details, adapted for streaming data.

3. **The HMNN paper itself (Rimella & Whiteley, 2025)** — Synthesizes these foundations by replacing discrete hidden states (from classic HMM tagging) with continuous neural network weights, and replacing MLE counting (from supervised HMM learning) with variational Bayes.

---

## 6. Assessment

**Rating: 7.5/10** — A technically sound contribution that addresses an important problem (continual learning with uncertainty) through a principled combination of HMMs and Bayesian neural networks. The main limitations are the scalability constraints and the relatively narrow empirical evaluation. The strongest impact would likely come from extending the framework to larger architectures and real-world sequence labeling tasks, where the HMM heritage provides a natural inductive bias.
