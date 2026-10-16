import streamlit as st
import matplotlib.pyplot as plt
import numpy as np
from modules.connectionist.hopfield import (
    generate_pattern_1, generate_pattern_2, generate_pattern_3,
    generate_pattern_4, generate_pattern_5, generate_pattern_6,
    train, corrupt, recall, energy
)
from modules.connectionist.rnn_model import generate_synthetic_sequences, train_rnn, rnn_predict_anomaly

st.title("🧠 Connectionist Models (Module D)")
st.write("Hopfield Network for pattern recall and RNN for sequence anomaly detection.")

tab1, tab2, tab3 = st.tabs(["Hopfield Network", "RNN Anomaly Detection", "Comparison"])

def plot_pattern(ax, pattern, title):
    ax.imshow(pattern.reshape(5, 5), cmap='Greys', interpolation='nearest', vmin=-1, vmax=1)
    ax.set_title(title, color="white")
    ax.axis('off')

with tab1:
    st.subheader("Hopfield Network (Associative Memory)")
    
    # Generate patterns
    patterns = [
        generate_pattern_1(), generate_pattern_2(), generate_pattern_3(),
        generate_pattern_4(), generate_pattern_5(), generate_pattern_6()
    ]
    
    col1, col2 = st.columns([1, 2])
    with col1:
        selected_idx = st.selectbox("Select Pattern to Corrupt", range(len(patterns)), format_func=lambda i: f"Pattern {i+1}")
        flip_frac = st.slider("Corruption Level (%)", 0, 50, 15) / 100.0
        
    if st.button("Run Hopfield Recall", type="primary"):
        W = train(patterns)
        original = patterns[selected_idx]
        corrupted = corrupt(original, flip_frac)
        
        # Track energy over iterations
        state = corrupted.copy()
        energies = [energy(W, state)]
        
        recovered = state.copy()
        n_features = len(recovered)
        for _ in range(100):
            changed = False
            indices = np.random.permutation(n_features)
            for i in indices:
                old_val = recovered[i]
                net_input = np.dot(W[i, :], recovered)
                new_val = 1 if net_input >= 0 else -1
                if new_val != old_val:
                    recovered[i] = new_val
                    changed = True
            energies.append(energy(W, recovered))
            if not changed:
                break
        
        colA, colB, colC = st.columns(3)
        
        fig1, ax1 = plt.subplots(figsize=(2, 2))
        plot_pattern(ax1, original, "Original")
        fig1.patch.set_alpha(0)
        colA.pyplot(fig1)
        
        fig2, ax2 = plt.subplots(figsize=(2, 2))
        plot_pattern(ax2, corrupted, f"Corrupted ({int(flip_frac*100)}%)")
        fig2.patch.set_alpha(0)
        colB.pyplot(fig2)
        
        fig3, ax3 = plt.subplots(figsize=(2, 2))
        plot_pattern(ax3, recovered, "Recovered")
        fig3.patch.set_alpha(0)
        colC.pyplot(fig3)
        
        st.write("### Energy over Iterations")
        fig_e, ax_e = plt.subplots(figsize=(6, 3))
        ax_e.plot(energies, 'go-', linewidth=2)
        ax_e.set_xlabel("Iteration", color='white')
        ax_e.set_ylabel("Energy", color='white')
        ax_e.tick_params(colors='white')
        fig_e.patch.set_alpha(0)
        ax_e.set_facecolor('none')
        st.pyplot(fig_e)

with tab2:
    st.subheader("RNN Anomaly Detection")
    st.write("Train an RNN to classify 10-step telemetry sequences as Normal (0) or Anomaly (1).")
    
    col1, col2 = st.columns(2)
    with col1:
        epochs = st.number_input("Epochs", 1, 50, 10)
    with col2:
        hidden_size = st.number_input("Hidden Size", 8, 128, 32)
        
    if st.button("Train RNN Model"):
        with st.spinner("Generating data and training RNN..."):
            X, y = generate_synthetic_sequences(n=500, seq_len=10)
            model, train_losses = train_rnn(X, y, hidden_size=hidden_size, epochs=epochs, lr=0.01)
            
            st.success("Training Complete!")
            
            fig, ax = plt.subplots(figsize=(6, 3))
            ax.plot(train_losses, 'b-', linewidth=2)
            ax.set_title("Training Loss", color='white')
            ax.set_xlabel("Epoch", color='white')
            ax.set_ylabel("Loss", color='white')
            ax.tick_params(colors='white')
            fig.patch.set_alpha(0)
            ax.set_facecolor('none')
            st.pyplot(fig)

with tab3:
    st.markdown("""
    ### Hopfield vs RNN Comparison

    | Feature | Hopfield Network | Recurrent Neural Network (RNN) |
    |---|---|---|
    | **What it can do** | Content-addressable memory, recovers corrupted static patterns (e.g. damaged QR codes). | Sequence classification, time-series forecasting, detecting temporal drift in sensors. |
    | **What it cannot do** | Handle temporal/sequential data. Capacity is limited (~0.138N patterns). | Cannot easily "fill in" corrupted static patterns instantly without sequential framing. |
    | **Why temporal matters** | N/A | In a warehouse, failures (like motor burnout) happen gradually over time, requiring memory of past states. |
    """)
